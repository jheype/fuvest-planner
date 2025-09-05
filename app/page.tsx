"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, PenSquare } from "lucide-react";
import { TaskItem } from "../components/task-item";
import { AddEditTaskDialog } from "../components/add-edit-task";
import { EssayDialog } from "../components/essay-dialog";
import { loadTasks, saveTasks, type StoredTask, type ResourceBundle } from "../lib/storage";

const SEED: StoredTask[] = [
  // -------- Semana 1 --------
  { id: "W1D1", title: "Matemática — Conjuntos, Intervalos e Operações", completed: false },
  { id: "W1D2", title: "Português — Classes de Palavras (morfologia) + Ortografia", completed: false },
  { id: "W1D3", title: "Física — Cinemática: MRU e MRUV (gráficos)", completed: false },
  { id: "W1D4", title: "História — Brasil Colônia: Economia Açucareira e Bandeirismo", completed: false },
  { id: "W1D5", title: "Redação — Leitura de propostas FUVEST + repertório (treino 01)", completed: false },

  // -------- Semana 2 --------
  { id: "W2D1", title: "Matemática — Funções (conceito, domínio/imagem) e Função Afim", completed: false },
  { id: "W2D2", title: "Química — Estrutura Atômica, Tabela Periódica e Ligações Químicas", completed: false },
  { id: "W2D3", title: "Biologia — Citologia: Membrana, Organelas e Transporte", completed: false },
  { id: "W2D4", title: "Geografia — Estrutura Geológica do Brasil e Relevo", completed: false },
  { id: "W2D5", title: "Literatura — Trovadorismo → Realismo (linha do tempo + características)", completed: false },

  // -------- Semana 3 --------
  { id: "W3D1", title: "Matemática — Função Quadrática (raízes, vértice, gráfico)", completed: false },
  { id: "W3D2", title: "Física — Lançamentos oblíquo/horizontal, alcance e altura máx.", completed: false },
  { id: "W3D3", title: "Química — Estequiometria (mol, massa, reagente limitante)", completed: false },
  { id: "W3D4", title: "História — Iluminismo e Revoluções Inglesas", completed: false },
  { id: "W3D5", title: "Redação — Tese, argumentação e projeto de texto (treino 02)", completed: false },

  // -------- Semana 4 --------
  { id: "W4D1", title: "Matemática — Progressões Aritméticas e Geométricas (PA/PG)", completed: false },
  { id: "W4D2", title: "Biologia — Genética: 1ª e 2ª Leis de Mendel", completed: false },
  { id: "W4D3", title: "Geografia — Climatologia: massas de ar, frentes e chuvas", completed: false },
  { id: "W4D4", title: "Português — Sintaxe: Período simples, termos essenciais e acessórios", completed: false },
  { id: "W4D5", title: "Literatura — Modernismo (1ª e 2ª fases) + obras cobradas", completed: false },

  // -------- Semana 5 --------
  { id: "W5D1", title: "Matemática — Logaritmos (propriedades e equações)", completed: false },
  { id: "W5D2", title: "Física — Leis de Newton e Atrito (planos, blocos)", completed: false },
  { id: "W5D3", title: "Química — Soluções: concentração, diluição e misturas", completed: false },
  { id: "W5D4", title: "História — Revolução Francesa e Era Napoleônica", completed: false },
  { id: "W5D5", title: "Redação — Coesão/coesão referencial + proposta (treino 03)", completed: false },

  // -------- Semana 6 --------
  { id: "W6D1", title: "Matemática — Trigonometria no triângulo (seno/cosseno/lei dos senos)", completed: false },
  { id: "W6D2", title: "Biologia — Evolução: seleção natural, deriva genética e especiação", completed: false },
  { id: "W6D3", title: "Geografia — População: transição demográfica e migrações no Brasil", completed: false },
  { id: "W6D4", title: "Português — Período composto: coordenação e subordinação", completed: false },
  { id: "W6D5", title: "Literatura — Obras de leitura obrigatória FUVEST (resumos + questões)", completed: false },

  // -------- Semana 7 --------
  { id: "W7D1", title: "Matemática — Geometria Plana: áreas, semelhança e polígonos", completed: false },
  { id: "W7D2", title: "Física — Trabalho, Energia e Potência (princípios e conservações)", completed: false },
  { id: "W7D3", title: "Química — Equilíbrios Químicos e Principio de Le Chatelier", completed: false },
  { id: "W7D4", title: "História — Brasil Império: 1º e 2º Reinado, café e escravidão", completed: false },
  { id: "W7D5", title: "Redação — Estratégias de repertório e contra-argumentação (treino 04)", completed: false },

  // -------- Semana 8 --------
  { id: "W8D1", title: "Matemática — Geometria Espacial: prismas, cilindros, cones e esferas", completed: false },
  { id: "W8D2", title: "Biologia — Ecologia: ciclos biogeoquímicos e cadeias alimentares", completed: false },
  { id: "W8D3", title: "Geografia — Agropecuária brasileira e agroindústria", completed: false },
  { id: "W8D4", title: "Português — Interpretação de texto e figuras de linguagem", completed: false },
  { id: "W8D5", title: "Literatura — Prosa contemporânea brasileira + estilos de época", completed: false },

  // -------- Semana 9 --------
  { id: "W9D1", title: "Matemática — Contagem e Probabilidade (princípios e arranjos)", completed: false },
  { id: "W9D2", title: "Física — Termologia: calor, dilatação e trocas térmicas", completed: false },
  { id: "W9D3", title: "Química — Oxirredução e Eletroquímica (pilhas e eletrólise)", completed: false },
  { id: "W9D4", title: "História — Brasil República: Vargas, JK, Ditadura e Nova República", completed: false },
  { id: "W9D5", title: "Redação — Treino completo com gestão de tempo (treino 05)", completed: false },

  // -------- Semana 10 --------
  { id: "W10D1", title: "Matemática — Análise de Gráficos/Modelagem e Estatística básica", completed: false },
  { id: "W10D2", title: "Biologia — Fisiologia Humana: sistemas respiratório e circulatório", completed: false },
  { id: "W10D3", title: "Geografia — Indústria, energia e logística (Brasil e mundo)", completed: false },
  { id: "W10D4", title: "Português — Concordância/Regência/Crase (pontos finos)", completed: false },
  { id: "W10D5", title: "Literatura — Revisão geral + questões autorais da FUVEST", completed: false },

  // -------- Semana 11 --------
  { id: "W11D1", title: "Revisão — Matemática (lista mista FUVEST/ENEM)", completed: false },
  { id: "W11D2", title: "Revisão — Ciências da Natureza (Física/Química/Biologia)", completed: false },
  { id: "W11D3", title: "Revisão — Humanas (História/Geografia/Filo/Socio)", completed: false },
  { id: "W11D4", title: "Simulado — 1ª fase Fuvest (prova antiga completa)", completed: false },
  { id: "W11D5", title: "Análise do simulado + ajuste de estratégia", completed: false },
];

export default function Page() {
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [q, setQ] = useState("");

  // dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [essayOpen, setEssayOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fromStore = loadTasks();
    setTasks(fromStore.length ? fromStore : SEED);
  }, []);

  useEffect(() => {
    if (tasks.length) saveTasks(tasks);
  }, [tasks]);

  const progress = useMemo(() => {
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / Math.max(tasks.length, 1)) * 100);
  }, [tasks]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return s ? tasks.filter((t) => t.title.toLowerCase().includes(s)) : tasks;
  }, [q, tasks]);

  // ----- Actions -----
  const onToggleAction = async (id: string, next: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
  };

  const onDeleteAction = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const onEditAction = (id: string) => {
    setEditingId(id);
    setEditOpen(true);
  };

  const addSubmit = async ({ title, resources }: { title: string; resources?: ResourceBundle }) => {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        resources,
      },
    ]);
  };

  const editSubmit = async ({ title, resources }: { title: string; resources?: ResourceBundle }) => {
    if (!editingId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title,
              resources: resources ?? t.resources,
            }
          : t
      )
    );
    setEditingId(null);
  };

  const editingTask = editingId ? tasks.find((t) => t.id === editingId) ?? null : null;

  return (
    <main className="min-h-screen bg-[#0D0F12] text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Fuvest Planner</h1>
              <p className="mt-2 text-zinc-400">
                Fluxo: 🎥 Videoaulas → 📘 Material → ❓ Questões (ENEM/FUVEST) + ✍️ Redação
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEssayOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 cursor-pointer transition-all"
                title="Abrir modal de Redação"
              >
                <PenSquare className="h-4 w-4" />
                Redação
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 cursor-pointer transition-all"
              >
                <Plus className="h-4 w-4" />
                Adicionar assunto
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por tema…"
              className="w-full rounded-lg bg-[#12151A] px-10 py-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="rounded-lg border border-white/10 bg-[#12151A] px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
              <span>Progresso</span>
              <span className="text-zinc-300 font-medium">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-zinc-300 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filtered.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggleAction={onToggleAction}
              onDeleteAction={onDeleteAction}
              onEditAction={onEditAction}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-500">Nada encontrado.</p>
          )}
        </div>
      </div>

      {/* Dialog: adicionar */}
      <AddEditTaskDialog
        open={addOpen}
        onOpenChangeAction={setAddOpen}
        variant="add"
        onSubmitAction={addSubmit}
      />

      {/* Dialog: editar */}
      <AddEditTaskDialog
        open={editOpen}
        onOpenChangeAction={setEditOpen}
        variant="edit"
        initialTitle={editingTask?.title}
        onSubmitAction={editSubmit}
      />

      {/* Dialog: redação */}
      <EssayDialog open={essayOpen} onOpenChangeAction={setEssayOpen} />
    </main>
  );
}