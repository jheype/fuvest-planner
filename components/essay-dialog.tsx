"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

type Scores = { c1: number; c2: number; c3: number; c4: number; c5: number; total: number };
type GradePayload = { feedback: string; scores: Scores };

export function EssayDialog({
  open,
  onOpenChangeAction,
}: {
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [suggesting, setSuggesting] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");
  const [essay, setEssay] = React.useState("");
  const [grade, setGrade] = React.useState<GradePayload | null>(null);
  const [bias, setBias] = React.useState<"FUVEST" | "ENEM" | "AUTO">("AUTO");

  React.useEffect(() => {
    if (open) {
      setGrade(null);
    }
  }, [open]);

  const suggest = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "suggest",
          bias: bias === "AUTO" ? undefined : [bias],
        }),
      });
      const data = (await res.json()) as { prompt?: string };
      setPrompt(data?.prompt || "Tema: Desafios da inclusão digital no Brasil.");
    } catch {
      setPrompt("Tema: Desafios da inclusão digital no Brasil.");
    } finally {
      setSuggesting(false);
    }
  };

  const doGrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "grade",
          prompt,
          essay,
        }),
      });
      const data = (await res.json()) as GradePayload;
      setGrade(data);
    } catch {
      setGrade({
        feedback:
          "Falha na correção. Verifique a conexão e sua OPENAI_API_KEY.",
        scores: { c1: 100, c2: 120, c3: 120, c4: 120, c5: 100, total: 560 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-2xl rounded-xl bg-[#0F1216] text-zinc-100 ring-1 ring-white/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Redação — Proposta e Correção</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-sm">Banca preferida (opcional)</Label>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md bg-[#12151A] px-3 py-2 text-sm ring-1 ring-white/10 outline-none"
                value={bias}
                onChange={(e) => setBias(e.target.value as "FUVEST" | "ENEM" | "AUTO")}
              >
                <option value="AUTO">Automático</option>
                <option value="FUVEST">FUVEST</option>
                <option value="ENEM">ENEM</option>
              </select>

              <Button
                type="button"
                onClick={suggest}
                disabled={suggesting}
                className="rounded-md bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              >
                {suggesting ? "Gerando tema..." : "Gerar tema"}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt" className="text-sm">Tema sugerido</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tema da redação"
              className="bg-[#12151A] ring-1 ring-white/10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="essay" className="text-sm">Sua redação (cole ou escreva aqui)</Label>
            <Textarea
              id="essay"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Digite sua redação completa aqui..."
              className="h-56 bg-[#12151A] ring-1 ring-white/10"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => onOpenChangeAction(false)}
              className="rounded-md bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={doGrade}
              disabled={loading || !essay.trim()}
              className="rounded-md bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              {loading ? "Corrigindo..." : "Corrigir redação"}
            </Button>
          </div>

          {grade && (
            <div className="rounded-lg border border-white/10 bg-[#0D1014] p-4">
              <p className="text-sm text-zinc-200 mb-2">Feedback</p>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">{grade.feedback}</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs text-zinc-300">
                <ScorePill label="C1" value={grade.scores.c1} />
                <ScorePill label="C2" value={grade.scores.c2} />
                <ScorePill label="C3" value={grade.scores.c3} />
                <ScorePill label="C4" value={grade.scores.c4} />
                <ScorePill label="C5" value={grade.scores.c5} />
                <ScorePill label="Total" value={grade.scores.total} accent />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScorePill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={[
        "rounded-md px-3 py-2 ring-1 text-center",
        accent ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" : "bg-[#0F1216] text-zinc-300 ring-white/10",
      ].join(" ")}
      title={label}
    >
      <div className="text-[10px] uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
