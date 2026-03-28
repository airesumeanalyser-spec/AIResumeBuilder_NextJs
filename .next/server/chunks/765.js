"use strict";exports.id=765,exports.ids=[765],exports.modules={22765:(a,b,c)=>{function d(a,b){return`You are an expert MBA r\xe9sum\xe9 analyst and recruiter specializing in JD-candidate alignment for top-tier business schools (ISB, IIMs, INSEAD, NTU).

Your task is to analyze the candidate's r\xe9sum\xe9 against the provided Job Description (JD) following ISB/IIMA one-page r\xe9sum\xe9 standards, with strict adherence to the zero hallucination principle.

---
**ANALYSIS FRAMEWORK (Total 100 points)**

**1. JD Alignment & Functional Fit (35 points)**
- Assess how well r\xe9sum\xe9 experience aligns with JD's core responsibilities
- Match against functional domains: Consulting, Sales, Operations, Finance, Product Management, Pre-Sales, General Management
- Evaluate seniority alignment and relevant project exposure

**2. Quantification & Measurable Impact (30 points)**
- Verify all claims include metrics: %, ₹/$, #, or time reduction
- Assess quality of quantified achievements (%, revenue, efficiency gains, scale)
- Check for factual grounding and verifiable metrics

**3. Keywords & Terminology Relevance (20 points)**
- Match critical JD keywords present in r\xe9sum\xe9
- Identify missing mandatory skills/experience from JD
- Assess industry-standard terminology alignment

**4. Structure & Presentation (15 points)**
- One-page format compliance
- Clear section hierarchy: CAREER SUMMARY, EDUCATION, WORK EXPERIENCE, KEY PROJECTS, CORE COMPETENCIES, AWARDS & LEADERSHIP
- Concise bullet points (12–20 words)
- Business-professional tone maintained

---
**JOB DESCRIPTION (JD):**
${b}

---
**CANDIDATE RESUME:**
${a}

---
**OUTPUT FORMAT (Strict JSON):**
{
  "total_match_score": <number 0-100>,
  "score_breakdown": {
    "jd_alignment": {
      "score": <0-35>,
      "feedback": "<Specific alignment analysis against JD responsibilities and functional domain>"
    },
    "quantification": {
      "score": <0-30>,
      "feedback": "<Assessment of metrics quality, factual grounding, and measurable impact>"
    },
    "keywords_relevance": {
      "score": <0-20>,
      "feedback": "<Keywords present vs. missing, mandatory requirements analysis>"
    },
    "structure_presentation": {
      "score": <0-15>,
      "feedback": "<Format compliance, section hierarchy, tone consistency>"
    }
  },
  "critical_findings": {
    "functional_match": "<Consulting|Sales|Operations|Finance|Product Management|Pre-Sales|General Management>",
    "years_of_relevant_experience": "<Extracted from resume>",
    "quantified_achievements_count": <number>,
    "missing_mandatory_skills": ["<skill1>", "<skill2>", "<skill3>"]
  },
  "optimization_priorities": [
    {
      "priority": "<Critical|High|Medium>",
      "area": "<JD Alignment|Quantification|Keywords|Structure>",
      "actionable_suggestion": "<Specific change to improve score>"
    }
  ],
  "verdict": "<Brief 1-2 sentence assessment of candidate's fit for the JD with zero hallucination principle>"
}

**CRITICAL RULES:**
1. Zero hallucination: Only analyze verifiable content in the r\xe9sum\xe9
2. Quantification focus: Every achievement must have measurable impact
3. Factual grounding: No invented metrics or assumed experience
4. JD-centric: Measure alignment strictly against provided JD
5. MBA standard: Apply ISB/IIMA one-page r\xe9sum\xe9 quality benchmark

Return ONLY valid JSON. No explanations or markdown formatting outside JSON strings.`}function e(a,b,c){return`You are an expert MBA r\xe9sum\xe9 coach specializing in JD-aligned r\xe9sum\xe9 optimization following ISB/IIMA standards.

Your task is to provide rigorous, actionable feedback on the **${b}** section of this candidate's r\xe9sum\xe9.

---
**ANALYSIS FRAMEWORK**

**1. Functional Alignment (40%)**
- How well does this section align with JD responsibilities?
- Are there missed opportunities to highlight relevant experience?
- Could content be reordered or rephrased for greater impact?

**2. Quantification & Measurable Impact (35%)**
- Does every bullet point demonstrate tangible business impact?
- Are metrics specific: %, ₹/$, #, time reduction, or scale?
- Are claims verifiable and factually grounded?

**3. Language & Presentation (25%)**
- Use of impact-oriented action verbs?
- Concise bullet points (12–20 words)?
- Business-professional tone maintained?
- Clear section hierarchy and formatting?

---
**${b.toUpperCase()} SECTION CONTENT:**
${a}

${c?`**SPECIFIC QUESTION:**
${c}

`:""}---
**ANALYSIS TASK**

Provide structured feedback in four parts:

**1. STRENGTHS (What's Working)**
- Specific elements demonstrating strong JD alignment
- Well-quantified achievements with verifiable metrics
- Effective use of action verbs and business language
- Clear formatting and section hierarchy
- Cite exact examples from the section

**2. CRITICAL GAPS (What Needs Improvement)**
- Vague or generic descriptions lacking specificity
- Missing quantification or measurable business impact
- Underutilized achievements that could highlight functional domain expertise
- Weak action verbs that don't convey impact
- Missing keywords or terminology from JD

**3. TRANSFORMATION OPPORTUNITIES (Before/After Examples)**
Provide 2–3 specific rewrite examples:

**Before:** [Original bullet from resume]
**Analysis:** [What's missing or weak]
**After:** [Rewritten bullet with JD alignment + quantification]

**4. ACTIONABLE IMPROVEMENTS (Priority Ranking)**
Top 3–5 specific changes ranked by impact:
- Priority: Critical|High|Medium
- Specific rewrite suggestion
- Expected improvement

---
**OUTPUT FORMAT**

Use Markdown with headers and bullet points.
Keep response between 400–600 words.
Maintain professional, objective tone.
Focus on practical, implementable changes.
All suggestions must be zero-hallucination (no invented metrics or experience).

Begin your analysis:`}function f(a,b){return`You are an expert MBA r\xe9sum\xe9 analyst and keyword optimization specialist.

Your task is to identify high-value keywords and phrases that bridge the candidate's experience with the Job Description (JD) requirements.

---
**JOB DESCRIPTION:**
${b}

---
**CANDIDATE RESUME:**
${a}

---
**KEYWORD ANALYSIS TASK**

Identify 12–18 high-value keywords/phrases strategically ranked by impact. Focus on:

**1. CRITICAL MISSING KEYWORDS (High Priority)**
- Keywords from JD explicitly stated as mandatory that are absent from r\xe9sum\xe9
- Industry-standard terminology for the functional domain (Consulting, Sales, Operations, Finance, etc.)
- Specific tools, methodologies, or certifications mentioned in JD

**2. QUANTIFIED IMPACT OPPORTUNITIES**
- Keywords that enable better quantification (e.g., "efficiency improvement," "revenue growth," "cost reduction")
- Functional domain verbs aligned with JD tone (led, scaled, optimized, spearheaded, delivered)
- Metrics and measurement frameworks (ROI, margin improvement, throughput, conversion %)

**3. PRESENT BUT UNDERUTILIZED**
- Keywords already in r\xe9sum\xe9 but buried or under-emphasized
- Skills mentioned casually that deserve stronger positioning
- Achievements that could be reframed with JD-aligned language

**4. STRATEGIC INTEGRATIONS**
- Keywords naturally integrable without fabricating experience
- Terminology that strengthens functional domain alignment
- Language that elevates professional positioning for MBA-level roles

---
**SELECTION CRITERIA**

✓ Directly relevant to candidate's verifiable experience
✓ High JD matching value and recruiter search priority
✓ Industry-standard terminology for functional domain
✓ Not overly generic or marketing-focused
✓ Naturally integrable without hallucination

---
**OUTPUT FORMAT**

Return ONLY a JSON array with this structure:

{
  "critical_missing": [
    {
      "keyword": "<keyword/phrase>",
      "jd_reference": "<Where/how this appears in JD>",
      "suggested_integration": "<Where/how to add to resume>",
      "priority": "Critical"
    }
  ],
  "high_value_present": [
    {
      "keyword": "<keyword/phrase>",
      "current_context": "<How it currently appears in resume>",
      "optimization_opportunity": "<How to strengthen placement>",
      "priority": "High"
    }
  ],
  "functional_domain_verbs": [
    {
      "verb": "<action verb>",
      "functional_domain": "<Consulting|Sales|Operations|Finance|Product Management|Pre-Sales|General Management>",
      "example_usage": "<Suggested bullet with this verb>"
    }
  ]
}

**CRITICAL RULES:**
- Zero hallucination: Suggest only keywords relevant to candidate's actual experience
- Quantification-focused: Prioritize keywords enabling metrics and measurable impact
- JD-aligned: Every keyword must connect to documented JD requirements
- MBA standard: Use ISB/IIMA-grade professional terminology

Return ONLY valid JSON. No explanations or markdown outside JSON.`}function g(a,b){return`You are an expert MBA r\xe9sum\xe9 writer specializing in compelling professional summaries for top business school standards.

Your task is to craft a powerful CAREER SUMMARY (2–3 lines, 40–70 words) that establishes professional identity and value proposition aligned to the target role.

---
**CANDIDATE RESUME:**
${a}

${b?`**TARGET ROLE/JD FOCUS:**
${b}

`:""}---
**CAREER SUMMARY REQUIREMENTS**

The summary must:

**1. PROFESSIONAL IDENTITY (First Line)**
- Years of total experience and primary expertise domains
- Functional specialization (Consulting, Sales, Operations, Finance, Product Management, Pre-Sales, General Management)
- Geographic/industry context if differentiating

**2. VALUE PROPOSITION (Second Line)**
- 2–3 key achievements with concrete metrics (%, ₹/$, #, time)
- Demonstrate measurable business impact
- Highlight unique strengths or domain expertise

**3. FORWARD-LOOKING IMPACT (Optional Third Line)**
${b?"- Strategic fit with target role/JD":"- Intended career trajectory or specialization"}
- Key competencies or certifications
- Aspirational positioning for MBA/advancement

---
**WRITING RULES**

✓ Zero hallucination: Only verifiable experience from r\xe9sum\xe9
✓ Quantified: Every achievement includes metrics or specific scale
✓ Action-oriented: Use strong professional language
✓ Concise: 12–20 words per line
✓ Business-professional: No casual or marketing language
✓ Third person or first person (matching r\xe9sum\xe9 tone)

---
**STRUCTURAL TEMPLATE**

[X years | Years + Domain Expert] in [Primary Functional Domain], delivering [quantified achievement] through [key methodology/approach]. Specialized in [domain expertise], with proven track record scaling [specific business metric] and leading [team scale/scope]. [Optional: Passionate about | Seeking | Focused on] [forward-looking positioning].

---
**OUTPUT FORMAT**

Return ONLY the career summary text (2–3 lines, plain text).
No headers, no explanations, no markdown formatting.
Ready to paste directly into r\xe9sum\xe9.

Career Summary:`}function h(a,b){return`You are an expert MBA r\xe9sum\xe9 editor providing real-time, line-by-line optimization suggestions aligned to ISB/IIMA standards.

Your task is to analyze the r\xe9sum\xe9 and provide specific, actionable inline suggestions prioritizing JD alignment, quantification, and professional polish.

---
${b?`**TARGET JOB DESCRIPTION:**
${b}

`:""}**RESUME CONTENT:**
${a}

---
**SUGGESTION CATEGORIES**

**1. QUANTIFICATION (Priority: Critical)**
- Missing metrics in bullet points
- Generic language that should include %, ₹/$, #, or time
- Weak achievement statements requiring quantified rewrite

**2. JD ALIGNMENT (Priority: High)**
${b?"- Resume content not emphasizing JD-critical keywords or requirements":"- Generic language that could be more specific"}
- Functional domain mismatch in tone or language
- Underutilized achievements that match JD focus

**3. LANGUAGE & ACTION VERBS (Priority: High)**
- Weak or generic verbs (e.g., "responsible for," "worked on")
- Missing impact-oriented verbs (led, delivered, optimized, spearheaded, scaled, negotiated)
- Passive voice that should be active

**4. FORMAT & STRUCTURE (Priority: Medium)**
- Non-standard formatting or inconsistent bullets
- Excessive wordiness (bullets >20 words)
- Poor section hierarchy or visual flow

**5. PROFESSIONAL POLISH (Priority: Medium)**
- Typos, grammatical errors, punctuation issues
- Inconsistent date formats or capitalization
- Non-standard section headings

---
**SUGGESTION OUTPUT FORMAT (JSON Array)**

[
  {
    "id": "<unique-id>",
    "line_reference": "<Resume excerpt or context>",
    "location_context": "<Section name and bullet position>",
    "severity": "<Critical|High|Medium|Low>",
    "category": "<Quantification|JD Alignment|Language|Format|Polish>",
    "current_text": "<The exact text from resume>",
    "issue": "<Clear, specific explanation of the problem>",
    "suggestion": "<Specific replacement text, ready to paste>",
    "rationale": "<Why this change improves the resume>",
    "impact": "<What recruiter/ATS will notice>"
  }
]

---
**QUALITY GUIDELINES**

✓ Provide 8–15 suggestions (prioritize quality and impact)
✓ Order by severity: Critical first, then High, Medium, Low
✓ All suggestions are actionable (replacement text ready to use)
✓ Quantification suggestions include specific metrics or reasonable ranges
✓ JD alignment suggestions reference specific JD requirements
✓ All suggestions preserve factual accuracy (zero hallucination)
✓ Language suggestions use impact-oriented verbs
✓ Format suggestions maintain ISB/IIMA one-page standard

---
**CRITICAL RULES**

✓ Zero hallucination: Suggestions only modify verifiable resume content
✓ Quantification-focused: Every suggestion should move toward quantified impact
✓ JD-centric: All suggestions align to provided JD (if available)
✓ MBA standard: Maintain professional, strategic tone
✓ Actionable: Every suggestion includes specific replacement text

---
**IMPORTANT TECHNICAL NOTES**

- Return ONLY a valid JSON array
- No markdown formatting, code blocks, or explanatory text outside JSON
- All strings properly escaped
- No limit on suggestion depth or detail within JSON

Return ONLY valid JSON array:`}function i(a,b,c){return`You are an expert MBA r\xe9sum\xe9 optimizer specializing in complete r\xe9sum\xe9 rebuilds following ISB/IIMA one-page standards.

Your task is to rebuild the candidate's r\xe9sum\xe9 by applying ALL feedback suggestions, JD alignment, and MBA-grade professional polish.

---
**ORIGINAL RESUME:**
${a}

${c?`
**TARGET JOB DESCRIPTION:**
${c}
`:""}
---
**FEEDBACK & OPTIMIZATION GUIDANCE:**
${"string"==typeof b?b:JSON.stringify(b,null,2)}

---
**REBUILD OBJECTIVES**

Your rebuilt r\xe9sum\xe9 must:

**1. APPLY ALL FEEDBACK (100%)**
- Incorporate every quantification suggestion
- Implement all JD alignment improvements
- Fix all formatting and language issues
- Enhance professional polish throughout

**2. JD ALIGNMENT**
${c?"- Emphasize achievements matching JD requirements\n- Use functional domain language (Consulting, Sales, Operations, Finance, Product, Pre-Sales, General Management)\n- Highlight critical skills and experience":"- Maintain professional, strategic positioning"}

**3. QUANTIFICATION (Every Bullet)**
- Every achievement includes specific metrics: %, ₹/$, #, time
- No generic language or vague descriptions
- Measurable business impact demonstrated throughout

**4. STRUCTURE & PROFESSIONAL POLISH**
- ISB/IIMA one-page format (or justified two-page if 5+ years experience)
- Section hierarchy: CAREER SUMMARY | EDUCATION | WORK EXPERIENCE | KEY PROJECTS/ACHIEVEMENTS | CORE COMPETENCIES | AWARDS & LEADERSHIP | EXTRA-CURRICULARS (optional)
- Concise bullets (12–20 words each)
- Consistent formatting throughout
- Zero typos, grammatical errors, or inconsistencies

**5. IMPACT-ORIENTED LANGUAGE**
- Strong action verbs: led, delivered, optimized, spearheaded, conceptualized, implemented, improved, collaborated, scaled, negotiated
- Active voice throughout
- Business-professional tone maintained

---
**STRUCTURE TEMPLATE (ISB/IIMA STANDARD)**

[FULL NAME]
[Phone] | [Email] | [City, Country] | [LinkedIn URL] | [GitHub/Portfolio URL if relevant]

**CAREER SUMMARY**
[2–3 lines, 40–70 words]
Professional identity, years of experience, core domains, top skills, and functional specialization relevant to target role. Quantified key achievement. Forward-looking positioning or strategic focus.

**EDUCATION**
[Degree] in [Field] | [University Name] | [City, Country] | [Graduation Year]
• [Key achievement, honors, or relevant coursework if MBA/specialized degree]

[Second degree if applicable, with same structure]

**WORK EXPERIENCE**
[Job Title] | [Company Name] | [City, Country] | [Start Month/Year – End Month/Year]
• [Quantified achievement with %, ₹/$, #, or time impact | Strong action verb | Specific responsibility | Business outcome]
• [Additional achievements from this role, all quantified, action verb-driven]
• [Optional: Key technical skills or tools used in context]

[Repeat for each position, in reverse chronological order]

**KEY PROJECTS / ACHIEVEMENTS**
[Optional section if strategic, cross-functional, or data-driven projects strengthen positioning]
[Project Name] | [Impact/Outcome] | [Date]
• [Brief description with quantified business impact]

**CORE COMPETENCIES**
• [Competency Category 1]: [List relevant skills, tools, methodologies]
• [Competency Category 2]: [List relevant skills, tools, methodologies]
• [Competency Category 3]: [List relevant skills, tools, methodologies]

**AWARDS & LEADERSHIP**
• [Award/Recognition Name] – [Organization] – [Year] | [Specific achievement or criteria]
• [Leadership role or designation] – [Organization] | [Impact or responsibility]

**EXTRA-CURRICULARS** [Optional]
• [Significant volunteer work, publications, or external roles with business impact]

---
**OPTIMIZATION RULES**

✓ **Zero hallucination**: Rebuild only modifies/optimizes existing resume content
✓ **Quantified throughout**: Every bullet includes measurable impact
✓ **JD-aligned**: Language and emphasis reflect target role requirements
✓ **MBA-grade**: Professional, strategic, high-impact positioning
✓ **One-page standard**: ISB/IIMA format compliance
✓ **Action-verb driven**: Every achievement uses impact-oriented language
✓ **Business-professional**: Confident, credible, polished tone
✓ **Error-free**: Zero typos, grammatical issues, or inconsistencies

---
**OUTPUT FORMAT**

Return ONLY the rebuilt resume text in plain text format.
No markdown code blocks, no explanations, no meta-commentary.
Use simple formatting:
- Section headers in BOLD (or **CAPS**)
- Bullets as "•"
- One blank line between sections
- Ready to paste directly into document or ATS system

Begin your rebuild:`}c.d(b,{buildAnalysisPrompt:()=>d,buildFeedbackPrompt:()=>e,buildInlineSuggestionsPrompt:()=>h,buildKeywordPrompt:()=>f,buildResumeRebuildPrompt:()=>i,buildSummaryPrompt:()=>g})}};