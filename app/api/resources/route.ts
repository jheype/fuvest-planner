import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getResources } from "../../../lib/resources";
import type { ResourceBundle, StudyLink } from "../../../lib/storage";

const Body = z.object({ title: z.string().min(3) });

const LinkSchema = z.object({
  label: z.string().min(2),
  url: z.string().url(),
});
const BundleSchema = z.object({
  videos: z.array(LinkSchema).min(1),
  materials: z.array(LinkSchema).min(1),
});

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

export async function POST(req: NextRequest) {
  try {
    const { title } = Body.parse(await req.json());

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ resources: getResources(title) });
    }

    const client = new OpenAI({ apiKey });

    const system = [
      "Sugira recursos de estudo para vestibulares (FUVEST/ENEM).",
      "Responda APENAS JSON (json_object) com arrays 'videos' e 'materials'.",
      "Cada item: { label, url }. Prefira YouTube (aulas), Khan Academy, Brasil Escola.",
      "2–3 vídeos e 2–3 materiais.",
    ].join(" ");

    const user = `
      TÍTULO: "${title}"
      Formato JSON:
      { "videos": [ { "label": "...", "url": "..." } ], "materials": [ { "label": "...", "url": "..." } ] }
    `.trim();

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 600,
    });

    const content = out.choices[0]?.message?.content?.trim() || "{}";
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      return NextResponse.json({ resources: getResources(title) });
    }

    const parsed = BundleSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ resources: getResources(title) });
    }

    const unique = (arr: StudyLink[]) => {
      const seen = new Set<string>();
      const outArr: StudyLink[] = [];
      for (const v of arr) {
        if (!seen.has(v.url)) {
          outArr.push(v);
          seen.add(v.url);
        }
      }
      return outArr.slice(0, 3);
    };

    const resources: ResourceBundle = {
      videos: unique(parsed.data.videos),
      materials: unique(parsed.data.materials),
    };

    return NextResponse.json({ resources });
  } catch (err: unknown) {
    return NextResponse.json(
      { resources: getResources("fallback"), error: getErrorMessage(err) },
      { status: 200 }
    );
  }
}
