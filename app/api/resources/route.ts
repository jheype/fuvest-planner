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

export async function POST(req: NextRequest) {
  try {
    const { title } = Body.parse(await req.json());

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const fb = getResources(title);
      return NextResponse.json({ resources: fb });
    }

    const client = new OpenAI({ apiKey });

    const system = [
      "Você sugere recursos de estudo para vestibulares (FUVEST/ENEM).",
      "Retorne APENAS JSON (json_object) com arrays 'videos' e 'materials'.",
      "Cada item tem { label, url }. Prefira links confiáveis:",
      "- Vídeo: YouTube (aulas), canais respeitados.",
      "- Material: Khan Academy, Brasil Escola, Mundo Educação, sites de universidades.",
      "No label, descreva brevemente o conteúdo.",
      "Forneça de 2 a 3 vídeos e 2 a 3 materiais.",
    ].join(" ");

    const user = `
        TÍTULO/TEMA: "${title}"

        Formato EXATO (json_object):
        {
        "videos": [
            { "label": "Função quadrática: vértice e concavidade — YouTube", "url": "https://..." }
        ],
        "materials": [
            { "label": "Khan Academy — Quadráticas", "url": "https://..." }
        ]
        }
    `.trim();

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 700,
    });

    const content = out.choices[0]?.message?.content?.trim() || "{}";
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      const fb = getResources(title);
      return NextResponse.json({ resources: fb });
    }

    const parsed = BundleSchema.safeParse(json);
    if (!parsed.success) {
      const fb = getResources(title);
      return NextResponse.json({ resources: fb });
    }

    const unique = (arr: StudyLink[]) => {
      const seen = new Set<string>();
      const out: StudyLink[] = [];
      for (const v of arr) {
        if (!seen.has(v.url)) {
          out.push(v);
          seen.add(v.url);
        }
      }
      return out.slice(0, 3);
    };

    const resources: ResourceBundle = {
      videos: unique(parsed.data.videos),
      materials: unique(parsed.data.materials),
    };

    return NextResponse.json({ resources });
  } catch (e: any) {
    const raw = await req.json().catch(() => ({ title: "" }));
    const title = typeof raw?.title === "string" ? raw.title : "tópico";
    const fb = getResources(title);
    return NextResponse.json({ resources: fb, error: e?.message ?? "fallback" }, { status: 200 });
  }
}
