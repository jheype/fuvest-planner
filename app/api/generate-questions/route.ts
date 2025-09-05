import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

// ---------- Schemas ----------
const Body = z.object({
  topic: z.string().min(3),
  num: z.number().min(3).max(8).default(5),
  sourceBias: z.array(z.enum(["FUVEST", "ENEM"])).optional(),
  years: z
    .object({ from: z.number().optional(), to: z.number().optional() })
    .optional(),
});

const QuestionSchema = z.object({
  statement: z.string().min(10),
  options: z.array(z.string().min(2)).length(4),
  correct: z.number().int().min(0).max(3),
  source: z.string().min(6),
  link: z.string().url().nullable().optional(),
  approximate: z.boolean(),
});

type Question = z.infer<typeof QuestionSchema>;

// ---------- Helpers ----------
function normalizeOptions(arr: string[]): string[] {
  const letters = ["A", "B", "C", "D"];
  return arr.map((o, i) => {
    const t = o.trim();
    const hasPrefix = /^[A-D]\)/.test(t);
    return hasPrefix ? t : `${letters[i]}) ${t}`;
  });
}

function capWords(s: string, maxWords = 110) {
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unknown error";
}

// ---------- Route ----------
export async function POST(req: NextRequest) {
  const nowYear = new Date().getFullYear();

  try {
    const parsed = Body.parse(await req.json());
    const { topic, num, sourceBias, years } = parsed;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
    if (!client.apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ausente no ambiente" },
        { status: 500 }
      );
    }

    const system = [
      "Você é um gerador de questões para vestibulares brasileiros.",
      "Retorne APENAS JSON (json_object), sem comentários ou texto fora do JSON.",
      "Priorize questões REAIS da FUVEST e ENEM.",
      "Se não tiver confiança no enunciado literal, gere paráfrase curta e marque approximate=true.",
      "Inclua 'source' com banca/ano/fase (ex.: '(FUVEST 2019 - 1ª fase)').",
      "Inclua 'link' para prova oficial se souber, senão null.",
      "4 alternativas (A–D), uma correta; índice 'correct' (0=A,1=B,2=C,3=D).",
      "Máx ~110 palavras no enunciado.",
    ].join(" ");

    const prefs =
      sourceBias && sourceBias.length ? `PRIORIZE: ${sourceBias.join(", ")}.` : "";
    const timeWindow =
      years?.from || years?.to
        ? `INTERVALO: ${years?.from ?? nowYear - 15}–${years?.to ?? nowYear}.`
        : `INTERVALO: ${nowYear - 15}–${nowYear}.`;

    const user = `
      TÓPICO: ${topic}
      QUANTIDADE: ${num}
      ${prefs}
      ${timeWindow}
      Formato JSON:
      { "questions": [ { "statement": "...", "options": ["A)...","B)...","C)...","D)..."], "correct": 2, "source": "(FUVEST 2021)", "link": "https://...", "approximate": false } ] }
    `.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-5",
      temperature: 0,
      response_format: { type: "json_object" },
      max_tokens: 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsedJson = JSON.parse(content);

    const questions: Question[] = [];
    for (const q of parsedJson.questions ?? []) {
      const res = QuestionSchema.safeParse(q);
      if (res.success) {
        const normalized: Question = {
          ...res.data,
          statement: capWords(res.data.statement),
          options: normalizeOptions(res.data.options),
        };
        questions.push(normalized);
      }
    }

    return NextResponse.json({ questions });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
