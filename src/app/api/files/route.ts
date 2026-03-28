import { NextRequest, NextResponse } from "next/server";
import { deleteResume } from "@/lib/db";
import {
  deleteFile,
  getFileMetadata,
  listFiles,
  readFile,
  uploadFile,
} from "@/lib/storage";
import { createServerSupabase } from "@/lib/supabase/server";

async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action") || "read";

  try {
    if (action === "read") {
      const path = request.nextUrl.searchParams.get("path");
      if (!path) {
        return NextResponse.json({ error: "Path required" }, { status: 400 });
      }
      const prefix = `${userId}/`;
      if (!path.startsWith(prefix)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const metadata = await getFileMetadata(path);
      if (!metadata) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const fileBuffer = await readFile(path);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": metadata.contentType,
          "Content-Length": String(metadata.size),
          "Content-Disposition": `inline; filename="${metadata.name}"`,
        },
      });
    }

    if (action === "list") {
      const pathParam = request.nextUrl.searchParams.get("path") || "";
      const folder = pathParam.replace(`${userId}/`, "").replace(/\/$/, "") || undefined;
      if (pathParam && !pathParam.startsWith(`${userId}/`)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const files = await listFiles(userId, folder);
      const formatted = files.map((file) => ({
        id: file.id,
        uid: file.id,
        name: file.name,
        path: file.path,
        is_dir: false,
        size: file.size,
        created: file.created.getTime(),
        modified: file.updated.getTime(),
        accessed: file.updated.getTime(),
        writable: true,
        parent_id: null,
        parent_uid: null,
      }));
      return NextResponse.json(formatted);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    console.error("files GET:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action") || "upload";
  const supabase = await createServerSupabase();

  try {
    if (action === "upload") {
      const formData = await request.formData();
      const uploaded: { buffer: Buffer; filename: string; mimeType: string }[] = [];
      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          uploaded.push({
            buffer,
            filename: value.name || "file",
            mimeType: value.type || "application/octet-stream",
          });
        }
      }
      if (uploaded.length === 0) {
        return NextResponse.json({ error: "No files" }, { status: 400 });
      }

      const uploadedItems = [];
      for (const file of uploaded) {
        const meta = await uploadFile(
          file.buffer,
          file.filename,
          file.mimeType,
          userId
        );
        uploadedItems.push({
          id: meta.id,
          uid: meta.id,
          name: meta.name,
          path: meta.path,
          is_dir: false,
          size: meta.size,
          created: meta.created.getTime(),
          modified: meta.updated.getTime(),
          accessed: meta.updated.getTime(),
          writable: true,
          parent_id: null,
          parent_uid: null,
        });
      }
      return NextResponse.json(uploadedItems[0] ?? uploadedItems);
    }

    if (action === "write") {
      const contentType = request.headers.get("content-type") || "";
      let path: string;
      let fileBuffer: Buffer;
      let ct = "text/plain";
      let fileName: string;

      if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        path = String(form.get("path") || "");
        const file = form.get("file");
        const text = form.get("content");
        if (file instanceof File && file.size > 0) {
          fileBuffer = Buffer.from(await file.arrayBuffer());
          ct = file.type || "application/octet-stream";
          fileName = file.name || path.split("/").pop() || "file";
        } else if (typeof text === "string") {
          fileBuffer = Buffer.from(text, "utf-8");
          fileName = path.split("/").pop() || "file";
        } else {
          return NextResponse.json({ error: "file or content required" }, { status: 400 });
        }
      } else {
        const body = await request.json();
        path = body.path;
        if (!path) {
          return NextResponse.json({ error: "Path required" }, { status: 400 });
        }
        if (body.content) {
          fileBuffer = Buffer.from(String(body.content), "utf-8");
          fileName = path.split("/").pop() || "file";
        } else {
          return NextResponse.json({ error: "content required" }, { status: 400 });
        }
      }

      const prefix = `${userId}/`;
      if (!path.startsWith(prefix)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const uploadedFile = await uploadFile(fileBuffer, fileName, ct, userId);
      return NextResponse.json({
        success: true,
        file: {
          id: uploadedFile.id,
          name: uploadedFile.name,
          path: uploadedFile.path,
          size: uploadedFile.size,
        },
      });
    }

    if (action === "delete") {
      const body = await request.json();
      const path = body.path as string;
      if (!path) {
        return NextResponse.json({ error: "Path required" }, { status: 400 });
      }
      const prefix = `${userId}/`;
      if (!path.startsWith(prefix)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await deleteFile(path);
      try {
        const fileId = path.split("/").pop()?.split(".")[0];
        if (fileId) {
          await deleteResume(supabase, fileId, userId);
        }
      } catch {
        /* resume row may not exist */
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (e) {
    console.error("files POST:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
