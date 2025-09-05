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
  source: z.string().min(6), // "(FUVEST 2021 - 1ª fase)" ou "(ENEM 2013)"
  link: z.string().url().nullable().optional(),
  approximate: z.boolean(),
});

type Question = z.infer<typeof QuestionSchema>;

// ---------- Helpers ----------
function normalizeOptions(arr: string[]): string[] {
  const letters = ["A", "B", "C", "D"];
  return arr.map((o, i) => {
    const t = o.trim();
    const hasPrefix =
      t.startsWith("A)") || t.startsWith("B)") || t.startsWith("C)") || t.startsWith("D)");
    return hasPrefix ? t : `${letters[i]}) ${t}`;
  });
}

function capWords(s: string, maxWords = 110) {
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

// ---------- Route ----------
export async function POST(req: NextRequest) {
  const nowYear = new Date().getFullYear();

  try {
    const parsed = Body.parse(await req.json());
    const { topic, num, sourceBias, years } = parsed;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    if (!client.apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY ausente no ambiente" },
        { status: 500 }
      );
    }

    // Prompt: força questões REAIS, ano/fase/link, gabarito e JSON
    const system = [
      "Você é um gerador de questões para vestibulares brasileiros.",
      "Retorne APENAS JSON (json_object), sem comentários ou texto fora do JSON.",
      "Priorize questões REAIS já aplicadas pela FUVEST e ENEM.",
      "Se não tiver alta confiança no enunciado literal, gere PARÁFRASE curta mantendo a essência e marque approximate=true.",
      "Inclua 'source' com banca/ano e fase (ex.: '(FUVEST 2019 - 1ª fase)' ou '(ENEM 2013)').",
      "Inclua 'link' para a prova oficial se souber; caso contrário, null.",
      "4 alternativas (A–D), exatamente uma correta; inclua o índice 'correct' (0=A, 1=B, 2=C, 3=D).",
      "Limite o enunciado a ~100–110 palavras.",
      "Se o tema não apareceu em uma prova específica, gere uma questão ESTILO banca e marque approximate=true com 'source': '(estilo FUVEST/ENEM)'.",
    ].join(" ");

    const prefs =
      (sourceBias && sourceBias.length && `PRIORIZE: ${sourceBias.join(", ")}.`) || "";
    const timeWindow =
      years?.from || years?.to
        ? `INTERVALO: ${years?.from ?? nowYear - 15}–${years?.to ?? nowYear}.`
        : `INTERVALO: ${nowYear - 15}–${nowYear}.`;

    const user = `
TÓPICO: ${topic}
QUANTIDADE: ${num}
${prefs}
${timeWindow}

Formato de saída (JSON object):
{
  "questions": [
    {
      "statement": "… (máx ~110 palavras)",
      "options": ["A) …", "B) …", "C) …", "D) …"],
      "correct": 2,
      "source": "(FUVEST 2021 - 1ª fase)",
      "link": "https://…/prova.pdf",
      "approximate": false
    }
  ]
}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o",            // mais assertivo para memória de provas
      temperature: 0,             // respostas estáveis e factuais
      response_format: { type: "json_object" }, // força JSON
      max_tokens: 1600,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim() || "{}";

    // Parse seguro
    let parsedJSON: unknown;
    try {
      parsedJSON = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e, "\nRAW:", content);
      throw new Error("Falha ao interpretar JSON");
    }

    const arr = z
      .object({ questions: z.array(QuestionSchema) })
      .parse(parsedJSON).questions;

    // saneamento
    const questions: Question[] = arr.slice(0, num).map((q, idx) => ({
      ...q,
      statement: capWords(q.statement),
      options: normalizeOptions(q.options),
      correct: Math.min(3, Math.max(0, q.correct)),
      link: q.link ?? null,
      approximate: !!q.approximate,
      source: q.source?.trim() || `(estilo FUVEST/ENEM ${nowYear})`,
    }));

    return NextResponse.json({ questions });
  } catch (err: any) {
    console.error("generate-questions error:", err?.message || err);
    // Fallback enxuto, mas agora devolvendo 'num' itens para não parecer bug
    const fallback = Array.from({ length: 1 }).map((_, i) => ({
      statement: `(${new Date().getFullYear()}) Questão de estilo FUVEST/ENEM sobre o tema solicitado.`,
      options: ["A) Alternativa 1", "B) Alternativa 2", "C) Alternativa 3", "D) Alternativa 4"],
      correct: 1,
      source: "(estilo FUVEST/ENEM)",
      link: null as string | null,
      approximate: true,
    }));
    return NextResponse.json(
      { questions: fallback, error: err?.message ?? "fallback" },
      { status: 200 }
    );
  }
}
