import { NextRequest, NextResponse } from "next/server";
import {
  chat,
  generateFeedback,
  extractTextFromFile,
  extractTextFromImage,
  convertResumeToMarkdown,
  rebuildResume,
  analyzeResume,
  getInlineSuggestions,
  type ChatMessage,
} from "@/lib/ai";
import { applyAISuggestions, analysisToSuggestions } from "@/lib/resume-parser";
import {
  incrementTrialUsage,
  canUseFreeTrial,
} from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase/server";
import { extractTextFromDOCX } from "@/lib/file-extraction";

export const runtime = "nodejs";
export const maxDuration = 120;

async function getAuthedUserId(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 200 }));
}

function chatResponseText(response: Awaited<ReturnType<typeof chat>>): string {
  const c = response.message?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c[0] && typeof (c[0] as { text?: string }).text === "string") {
    return (c[0] as { text: string }).text;
  }
  return "";
}

export async function GET(request: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) {
    return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const action = request.nextUrl.searchParams.get("action") || "";
  const supabase = await createServerSupabase();

  if (action === "check-trial") {
    const canUse = await canUseFreeTrial(supabase, userId);
    return cors(
      NextResponse.json({ success: true, canUseFreeTrial: canUse })
    );
  }

  return cors(NextResponse.json({ error: "Method not allowed" }, { status: 405 }));
}

export async function POST(request: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) {
    return cors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const action = request.nextUrl.searchParams.get("action") || "chat";
  const supabase = await createServerSupabase();

  try {
    switch (action) {
      case "chat": {
        const body = await request.json();
        const { messages, temperature, maxTokens } = body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          return cors(
            NextResponse.json(
              { success: false, error: "Messages array is required" },
              { status: 400 }
            )
          );
        }
        const response = await chat(messages as ChatMessage[], {
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 2048,
        });
        return cors(
          NextResponse.json({ success: true, response })
        );
      }

      case "feedback": {
        const body = await request.json();
        const { resumeText, section, question } = body;
        if (!resumeText || !section) {
          return cors(
            NextResponse.json({ success: false, error: "resumeText and section required" }, { status: 400 })
          );
        }
        const feedback = await generateFeedback(resumeText, section, question);
        return cors(NextResponse.json({ success: true, feedback }));
      }

      case "img2txt": {
        const formData = await request.formData();
        const file = formData.get("image");
        const imageUrl = formData.get("imageUrl");

        let extractedText: string;
        if (file instanceof File && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          extractedText = await extractTextFromImage(buffer);
        } else if (typeof imageUrl === "string" && imageUrl) {
          extractedText = await extractTextFromFile(imageUrl);
        } else {
          return cors(
            NextResponse.json({ success: false, error: "No image provided" }, { status: 400 })
          );
        }
        return cors(NextResponse.json({ success: true, text: extractedText }));
      }

      case "convert-to-markdown": {
        const body = await request.json();
        const { resumeText } = body;
        if (!resumeText) {
          return cors(
            NextResponse.json({ success: false, error: "resumeText required" }, { status: 400 })
          );
        }
        const markdown = await convertResumeToMarkdown(resumeText);
        return cors(NextResponse.json({ success: true, markdown }));
      }

      case "rebuild-resume": {
        const body = await request.json();
        const { resumeText, feedback, jobDescription } = body;
        if (!resumeText) {
          return cors(
            NextResponse.json({ success: false, error: "resumeText required" }, { status: 400 })
          );
        }
        const rebuilt = await rebuildResume(resumeText, feedback, jobDescription);
        return cors(NextResponse.json({ success: true, rebuiltResume: rebuilt }));
      }

      case "analyze": {
        const body = await request.json();
        const { resumeText, jobDescription } = body;
        if (!resumeText) {
          return cors(
            NextResponse.json({ success: false, error: "resumeText required" }, { status: 400 })
          );
        }
        const analysis = await analyzeResume(resumeText, jobDescription);
        return cors(NextResponse.json({ success: true, analysis }));
      }

      case "inline-suggestions": {
        const body = await request.json();
        const { resumeText, jobDescription } = body;
        if (!resumeText) {
          return cors(
            NextResponse.json({ success: false, error: "resumeText required" }, { status: 400 })
          );
        }
        const suggestions = await getInlineSuggestions(resumeText, jobDescription);
        return cors(NextResponse.json({ success: true, suggestions }));
      }

      case "apply-suggestions": {
        const body = await request.json();
        const { markdown, analysis, selectedIds } = body;
        if (!markdown || !analysis) {
          return cors(
            NextResponse.json({ success: false, error: "markdown and analysis required" }, { status: 400 })
          );
        }
        const suggestions = analysisToSuggestions(analysis);
        const toApply =
          selectedIds && Array.isArray(selectedIds)
            ? suggestions.filter((_: unknown, idx: number) => selectedIds.includes(idx))
            : suggestions;
        const updatedMarkdown = applyAISuggestions(markdown, toApply);
        return cors(
          NextResponse.json({
            success: true,
            updatedMarkdown,
            appliedCount: toApply.length,
          })
        );
      }

      case "extract-jd": {
        const formData = await request.formData();
        const jdFile = formData.get("file") ?? formData.get("files");
        if (!(jdFile instanceof File) || jdFile.size === 0) {
          return cors(
            NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
          );
        }
        const fileBuffer = Buffer.from(await jdFile.arrayBuffer());
        const sig = fileBuffer.subarray(0, 4).toString("hex").toLowerCase();
        let jdText = "";

        if (sig.startsWith("504b")) {
          jdText = extractTextFromDOCX(fileBuffer);
        } else if (sig.startsWith("2550")) {
          const { extractTextFromPDF } = await import("@/lib/file-extraction");
          jdText = await extractTextFromPDF(fileBuffer);
        } else if (
          sig.startsWith("89") ||
          sig.startsWith("ffd8") ||
          sig.startsWith("474946")
        ) {
          jdText = await extractTextFromImage(fileBuffer);
        } else {
          return cors(
            NextResponse.json({ success: false, error: "Unsupported file format" }, { status: 400 })
          );
        }

        if (!jdText?.trim()) {
          return cors(
            NextResponse.json({ success: false, error: "No text extracted" }, { status: 400 })
          );
        }

        const extractionPrompt = `You are a job description analyzer. Extract the following information from this Job Description and return ONLY a valid JSON object (no markdown, no extra text):

{
  "jobTitle": "The job title or position name",
  "companyName": "The company name if mentioned, otherwise 'Not specified'",
  "jobDescription": "The full cleaned job description text"
}

JD TEXT:
${jdText}

Return ONLY valid JSON.`;

        try {
          const response = await chat(
            [{ role: "user", content: extractionPrompt }],
            { temperature: 0.3, maxTokens: 2048 }
          );
          const responseText = chatResponseText(response);
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            return cors(
              NextResponse.json({
                success: true,
                jobTitle: "Job Description",
                companyName: "Not specified",
                jobDescription: jdText,
              })
            );
          }
          const result = JSON.parse(jsonMatch[0]) as {
            jobTitle?: string;
            companyName?: string;
            jobDescription?: string;
          };
          return cors(
            NextResponse.json({
              success: true,
              jobTitle: result.jobTitle || "Not specified",
              companyName: result.companyName || "Not specified",
              jobDescription: result.jobDescription || jdText,
            })
          );
        } catch {
          return cors(
            NextResponse.json({
              success: true,
              jobTitle: "Job Description",
              companyName: "Not specified",
              jobDescription: jdText,
            })
          );
        }
      }

      case "use-trial": {
        const canUse = await canUseFreeTrial(supabase, userId);
        if (!canUse) {
          return cors(
            NextResponse.json(
              {
                success: false,
                error: "Free trial limit reached (3/3 uses). Please upgrade to continue.",
                trialExhausted: true,
              },
              { status: 403 }
            )
          );
        }
        const result = await incrementTrialUsage(supabase, userId);
        return cors(
          NextResponse.json({
            success: true,
            trial: {
              used: result.used,
              remaining: result.remaining,
              max: result.max,
            },
          })
        );
      }

      case "check-trial": {
        const canUse = await canUseFreeTrial(supabase, userId);
        return cors(NextResponse.json({ success: true, canUseFreeTrial: canUse }));
      }

      default:
        return cors(
          NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 })
        );
    }
  } catch (error) {
    console.error("AI route:", error);
    return cors(
      NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Internal error",
      }, { status: 500 })
    );
  }
}
