"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

type Question = { statement: string; options: string[]; correct: number; source: string };

export function QuizDialog({
  open,
  onOpenChangeAction,
  topic,
  onFinishAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  topic: string;
  onFinishAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setQs([]); setIdx(0); setSel(null); setScore(0); setDone(false);
    }
  }, [open]);

  const progress = useMemo(
    () => (qs.length ? Math.round((idx / qs.length) * 100) : 0),
    [idx, qs.length]
  );

  const getQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, num: 10 }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.questions?.length) {
        setQs(data.questions);
      } else {
        throw new Error("fallback");
      }
    } catch {
      setQs([
        { statement: `(${topic}) — conceito central`, options: ["A) ...", "B) ...", "C) ...", "D) ..."], correct: 2, source: "(ENEM 2013)" },
        { statement: `(${topic}) — aplicação simples`, options: ["A) ...", "B) ...", "C) ...", "D) ..."], correct: 1, source: "(FUVEST 2021)" },
        { statement: `(${topic}) — interpretação`, options: ["A) ...", "B) ...", "C) ...", "D) ..."], correct: 0, source: "(UNICAMP 2020)" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const choose = (i: number) => {
    if (sel !== null) return;
    setSel(i);
    if (i === qs[idx].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx < qs.length - 1) {
      setIdx((v) => v + 1);
      setSel(null);
    } else {
      setDone(true);
    }
  };

  const closeAll = () => {
    onOpenChangeAction(false);
    onFinishAction();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-xl rounded-xl bg-[#0F1216] text-zinc-100 ring-1 ring-white/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Questões — {topic}</DialogTitle>
        </DialogHeader>

        {qs.length === 0 && !loading && !done && (
          <div className="py-2">
            <Button
              onClick={getQuestions}
              className="w-full rounded-md bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700"
            >
              Gerar questões (ENEM/FUVEST)
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        )}

        {qs.length > 0 && !done && !loading && (
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Questão {idx + 1} / {qs.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-zinc-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-base leading-relaxed text-zinc-200">{qs[idx].statement}</p>

            <div className="grid gap-2">
              {qs[idx].options.map((opt, i) => {
                const correct = sel !== null && i === qs[idx].correct;
                const wrong = sel !== null && i === sel && !correct;
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={sel !== null}
                    className={[
                      "text-left rounded-md px-4 py-2 ring-1 transition",
                      "bg-[#0D1014] ring-white/10 hover:bg-white/5",
                      sel !== null && correct && "bg-emerald-500/15 ring-emerald-400/40",
                      sel !== null && wrong && "bg-rose-500/15 ring-rose-400/40",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{qs[idx].source}</span>
              <Button
                onClick={next}
                className="rounded-md bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700 disabled:opacity-50"
                disabled={sel === null}
              >
                {idx < qs.length - 1 ? "Próxima" : "Finalizar"}
              </Button>
            </div>
          </div>
        )}

        {done && (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <p className="text-lg font-semibold">Quiz concluído!</p>
            <p className="text-sm text-zinc-300">
              Pontuação: <span className="font-semibold">{score}</span> / {qs.length}
            </p>
            <Button
              onClick={closeAll}
              className="mt-2 rounded-md bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700"
            >
              Marcar tarefa como concluída
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
