import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getResources } from "../../../lib/resources";
import type { ResourceBundle, StudyLink } from "../../../lib/storage";
import {
  normalizeVideosToSearchIfBroken,
  dedupeLinks,
  toYouTubeSearch,
} from "../../../lib/youtube";

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

async function fetchYouTubeTop(q: string, max = 3): Promise<StudyLink[]> {
  try {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return [];
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/youtube-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q, max }),
    });
    const data = await res.json();
    const items = (data?.items ?? []) as { label: string; url: string }[];
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((x) => ({ label: x.label, url: x.url }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title } = Body.parse(await req.json());

    const apiKey = process.env.OPENAI_API_KEY;
    let resources: ResourceBundle | null = null;

    if (!apiKey) {
      resources = getResources(title);
    } else {
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
        resources = getResources(title);
      }

      if (!resources) {
        const parsed = BundleSchema.safeParse(json);
        resources = parsed.success ? parsed.data : getResources(title);
      }
    }

    const query = `${title} aula FUVEST ENEM`;
    const useApiVideos = await fetchYouTubeTop(query, 3);
    let finalVideos: StudyLink[];
    if (useApiVideos.length > 0) {
      finalVideos = useApiVideos;
    } else {
      const normalized = normalizeVideosToSearchIfBroken(
        (resources?.videos ?? []).map((v) => ({ label: v.label, url: v.url })),
        query
      );
      finalVideos = normalized.map((v) => ({ label: v.label, url: v.url }));
      if (finalVideos.length === 0) {
        finalVideos = [
          { label: "YouTube — videoaulas sobre o tema", url: toYouTubeSearch(query) },
        ];
      }
    }

    const unique = (arr: StudyLink[]) => {
      return dedupeLinks(arr).slice(0, 3);
    };

    const result: ResourceBundle = {
      videos: unique(finalVideos),
      materials: unique(resources?.materials ?? []),
    };

    return NextResponse.json({ resources: result });
  } catch (err: unknown) {
    return NextResponse.json(
      { resources: getResources("fallback"), error: getErrorMessage(err) },
      { status: 200 }
    );
  }
}
