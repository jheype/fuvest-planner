import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

/** Body schema */
const Years = z.object({ from: z.number().optional(), to: z.number().optional() }).optional();
const Mode = z.enum(["suggest", "grade"]);

const Body = z.object({
  mode: Mode,
  bias: z.array(z.enum(["FUVEST", "ENEM"])).optional(),
  years: Years,
  prompt: z.string().optional(),
  essay: z.string().optional(),
});

type SuggestPayload = { prompt: string };
type GradeScores = {
  c1: number; // Domínio da escrita formal (0–200)
  c2: number; // Compreensão do tema (0–200)
  c3: number; // Seleção/organização de argumentos (0–200)
  c4: number; // Coesão e coerência (0–200)
  c5: number; // Proposta de intervenção (0–200)
  total: number; // 0–1000
};
type GradePayload = { feedback: string; scores: GradeScores };

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
    const body = Body.parse(await req.json());
    const apiKey = process.env.OPENAI_API_KEY || "";
    const client = new OpenAI({ apiKey });

    if (!apiKey) {
      // fallback sem IA
      if (body.mode === "suggest") {
        const placeholder: SuggestPayload = {
          prompt:
            "Tema (fallback): Os desafios da mobilidade urbana sustentável nas metrópoles brasileiras.",
        };
        return NextResponse.json(placeholder);
      }
      const neutral: GradePayload = {
        feedback:
          "Não foi possível usar a IA para correção (sem OPENAI_API_KEY). Revise tese, coesão e proposta de intervenção.",
        scores: { c1: 120, c2: 140, c3: 140, c4: 140, c5: 120, total: 660 },
      };
      return NextResponse.json(neutral);
    }

    if (body.mode === "suggest") {
      const nowYear = new Date().getFullYear();
      const yearsText =
        body.years?.from || body.years?.to
          ? `Período: ${body.years?.from ?? nowYear - 12}–${body.years?.to ?? nowYear}.`
          : `Período: ${nowYear - 12}–${nowYear}.`;
      const bias = body.bias && body.bias.length ? `Priorize: ${body.bias.join(", ")}.` : "";

      const system =
        "Você é um elaborador de temas de redação para vestibulares brasileiros (FUVEST/ENEM).";
      const user = `
            Sugira 1 tema atual e relevante, no formato de proposta de redação sintetizada (1–2 períodos),
            compatível com FUVEST/ENEM. Inclua recorte claro e apontamento de problematização.
            ${bias}
            ${yearsText}
            Retorne APENAS JSON (json_object) no formato: { "prompt": "..." }.
        `.trim();

      const out = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 300,
      });

      const content = out.choices[0]?.message?.content?.trim() || "{}";
      const json = JSON.parse(content) as SuggestPayload;
      if (!json.prompt || typeof json.prompt !== "string") {
        return NextResponse.json({ prompt: "Tema: Desafios da inclusão digital no Brasil." });
      }
      return NextResponse.json(json);
    }

    const p = (body.prompt || "").trim();
    const e = (body.essay || "").trim();
    if (!e) {
      return NextResponse.json({ error: "Essay vazio." }, { status: 400 });
    }

    const systemGrade = [
      "Você é um corretor de redações com base na matriz do ENEM.",
      "Avalie o texto do candidato e atribua notas por competência (C1..C5), cada uma de 0 a 200.",
      "Some para obter total (0–1000).",
      "Forneça feedback objetivo e acionável.",
      "Retorne APENAS JSON (json_object) no formato:",
      `{ "feedback": "...", "scores": { "c1": 0, "c2": 0, "c3": 0, "c4": 0, "c5": 0, "total": 0 } }`,
    ].join(" ");

    const userGrade = `
        PROMPT: ${p || "(sem prompt explícito)"}

        REDAÇÃO:
        """${e}"""
    `.trim();

    const graded = await client.chat.completions.create({
      model: "gpt-5",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemGrade },
        { role: "user", content: userGrade },
      ],
      max_tokens: 800,
    });

    const result = graded.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(result) as GradePayload;

    const clamp = (n: unknown): number => {
      const x = typeof n === "number" ? n : 0;
      return Math.max(0, Math.min(200, Math.round(x)));
    };
    const scores: GradeScores = {
      c1: clamp(parsed?.scores?.c1),
      c2: clamp(parsed?.scores?.c2),
      c3: clamp(parsed?.scores?.c3),
      c4: clamp(parsed?.scores?.c4),
      c5: clamp(parsed?.scores?.c5),
      total: 0,
    };
    scores.total = Math.max(
      0,
      Math.min(1000, scores.c1 + scores.c2 + scores.c3 + scores.c4 + scores.c5)
    );

    const payload: GradePayload = {
      feedback: (parsed?.feedback || "Sem feedback detalhado.").toString(),
      scores,
    };

    return NextResponse.json(payload);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        feedback:
          "Não foi possível corrigir agora. Tente novamente mais tarde e verifique sua OPENAI_API_KEY.",
        scores: { c1: 100, c2: 120, c3: 120, c4: 120, c5: 100, total: 560 },
        error: getErrorMessage(err),
      },
      { status: 200 }
    );
  }
}