"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { ResourceBundle } from "../lib/storage";

type Props = {
  open: boolean;
  onOpenChangeAction: (o: boolean) => void;

  variant: "add" | "edit";
  initialTitle?: string;

  onSubmitAction: (data: { title: string; resources?: ResourceBundle }) => Promise<void> | void;
};

export function AddEditTaskDialog({
  open,
  onOpenChangeAction,
  variant,
  initialTitle,
  onSubmitAction,
}: Props) {
  const [title, setTitle] = React.useState(initialTitle ?? "");
  const [loading, setLoading] = React.useState(false);
  const [useAI, setUseAI] = React.useState(true);
  const isEdit = variant === "edit";

  React.useEffect(() => {
    if (open) {
      setTitle(initialTitle ?? "");
      setUseAI(true);
      setLoading(false);
    }
  }, [open, initialTitle, variant]);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;
    setLoading(true);
    try {
      let resources: ResourceBundle | undefined = undefined;
      if (useAI) {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: t }),
        });
        const data = await res.json();
        if (data?.resources) resources = data.resources as ResourceBundle;
      }
      await onSubmitAction({ title: t, resources });
      onOpenChangeAction(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-lg rounded-xl bg-[#0F1216] text-zinc-100 ring-1 ring-white/10">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {isEdit ? "Editar assunto" : "Adicionar assunto"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="title">Matéria / assunto</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Ex.: "Matemática — Função Quadrática (vértice e concavidade)"'
              className="bg-[#12151A] ring-1 ring-white/10"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            Gerar videoaulas e materiais automaticamente (IA)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => onOpenChangeAction(false)}
              className="rounded-md bg-zinc-800 text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={loading || !title.trim()}
              className="rounded-md bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              type="button"
            >
              {loading ? (isEdit ? "Salvando..." : "Adicionando...") : isEdit ? "Salvar" : "Adicionar"}
            </Button>
          </div>

          {!useAI && (
            <p className="text-xs text-zinc-500">
              Dica: você pode ativar a IA depois para preencher recursos automaticamente.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
