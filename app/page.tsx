"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, PenSquare, FolderPlus, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { TaskItem } from "../components/task-item";
import { AddEditTaskDialog } from "../components/add-edit-task";
import { EssayDialog } from "../components/essay-dialog";
import {
  loadSubjects,
  saveSubjects,
  findSubjectByName,
  type Subject,
  type Topic,
  type ResourceBundle,
} from "../lib/storage";

// SEED opcional
const SEED_SUBJECTS: Subject[] = [
  {
    id: "mat",
    name: "Matemática",
    topics: [
      { id: "mat-1", subjectId: "mat", subjectName: "Matemática", title: "Conjuntos, intervalos e operações", completed: false },
      { id: "mat-2", subjectId: "mat", subjectName: "Matemática", title: "Função afim (coeficientes, gráfico)", completed: false },
    ],
    completed: false,
  },
  {
    id: "por",
    name: "Português",
    topics: [
      { id: "por-1", subjectId: "por", subjectName: "Português", title: "Classes de palavras + Ortografia", completed: false },
    ],
    completed: false,
  },
];

export default function Page() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [q, setQ] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [essayOpen, setEssayOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fromStore = loadSubjects();
    const data = fromStore.length ? fromStore : SEED_SUBJECTS;
    setSubjects(data);
    const col: Record<string, boolean> = {};
    for (const s of data) col[s.id] = false;
    setCollapsed(col);
  }, []);

  useEffect(() => {
    if (subjects.length) saveSubjects(subjects);
  }, [subjects]);

  const progress = useMemo(() => {
    const all: Topic[] = subjects.flatMap((s) => s.topics);
    const done = all.filter((t) => t.completed).length;
    return Math.round((done / Math.max(all.length, 1)) * 100);
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return subjects;
    return subjects
      .map((subj) => ({
        ...subj,
        topics: subj.topics.filter(
          (t) =>
            subj.name.toLowerCase().includes(s) ||
            t.title.toLowerCase().includes(s)
        ),
      }))
      .filter((subj) => subj.topics.length > 0 || subj.name.toLowerCase().includes(s));
  }, [q, subjects]);

  const onToggleAction = async (topicId: string, next: boolean) => {
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => (t.id === topicId ? { ...t, completed: next } : t)),
      }))
    );
  };

  const onDeleteAction = async (topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => ({ ...s, topics: s.topics.filter((t) => t.id !== topicId) }))
    );
  };

  const onEditAction = (topicId: string) => {
    setEditingTopicId(topicId);
    setEditOpen(true);
  };

  const addSubmit = async ({
    subjectName,
    topicTitle,
    resources,
  }: {
    subjectName: string;
    topicTitle: string;
    resources?: ResourceBundle;
  }) => {
    setSubjects((prev) => {
      const found = findSubjectByName(prev, subjectName);
      if (found) {
        const newTopic: Topic = {
          id: crypto.randomUUID(),
          subjectId: found.id,
          subjectName: found.name,
          title: topicTitle,
          completed: false,
          resources,
        };
        return prev.map((s) => (s.id === found.id ? { ...s, topics: [...s.topics, newTopic] } : s));
      }
      const newSubjectId = crypto.randomUUID();
      const newSubject: Subject = {
        id: newSubjectId,
        name: subjectName,
        topics: [
          {
            id: crypto.randomUUID(),
            subjectId: newSubjectId,
            subjectName,
            title: topicTitle,
            completed: false,
            resources,
          },
        ],
        completed: false,
      };
      return [...prev, newSubject];
    });
    setCollapsed((prev) => ({ ...prev, /* expand */ }));
  };

  const editSubmit = async ({
    subjectName,
    topicTitle,
    resources,
  }: {
    subjectName: string;
    topicTitle: string;
    resources?: ResourceBundle;
  }) => {
    if (!editingTopicId) return;

    setSubjects((prev) => {
      let currentSubjectIndex = -1;
      let topicIndex = -1;
      for (let i = 0; i < prev.length; i++) {
        const idx = prev[i].topics.findIndex((t) => t.id === editingTopicId);
        if (idx >= 0) {
          currentSubjectIndex = i;
          topicIndex = idx;
          break;
        }
      }
      if (currentSubjectIndex < 0 || topicIndex < 0) return prev;

      const oldTopic = prev[currentSubjectIndex].topics[topicIndex];
      const isSameSubject =
        prev[currentSubjectIndex].name.trim().toLowerCase() === subjectName.trim().toLowerCase();

      if (!isSameSubject) {
        const newPrev = prev.map((s, i) =>
          i === currentSubjectIndex
            ? { ...s, topics: s.topics.filter((t) => t.id !== editingTopicId) }
            : s
        );

        const target = findSubjectByName(newPrev, subjectName);
        if (target) {
          const moved: Topic = {
            ...oldTopic,
            id: oldTopic.id,
            subjectId: target.id,
            subjectName: target.name,
            title: topicTitle,
            resources: resources ?? oldTopic.resources,
            completed: oldTopic.completed,
          };
          return newPrev.map((s) => (s.id === target.id ? { ...s, topics: [...s.topics, moved] } : s));
        } else {
          const newSubjectId = crypto.randomUUID();
          const moved: Topic = {
            ...oldTopic,
            id: oldTopic.id,
            subjectId: newSubjectId,
            subjectName,
            title: topicTitle,
            resources: resources ?? oldTopic.resources,
            completed: oldTopic.completed,
          };
          return [
            ...newPrev,
            { id: newSubjectId, name: subjectName, topics: [moved], completed: false },
          ];
        }
      }

      return prev.map((s, i) =>
        i === currentSubjectIndex
          ? {
              ...s,
              topics: s.topics.map((t) =>
                t.id === editingTopicId
                  ? {
                      ...t,
                      title: topicTitle,
                      subjectName: s.name,
                      resources: resources ?? t.resources,
                    }
                  : t
              ),
            }
          : s
      );
    });

    setEditingTopicId(null);
  };

  const toggleCollapse = (subjectId: string) => {
    setCollapsed((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  const toggleSubjectCompleted = (subjectId: string, next: boolean) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              completed: next,
              topics: s.topics.map((t) => ({ ...t, completed: next })),
            }
          : s
      )
    );
  };

  const editingTopic = ((): Topic | null => {
    if (!editingTopicId) return null;
    for (const s of subjects) {
      const t = s.topics.find((x) => x.id === editingTopicId);
      if (t) return t;
    }
    return null;
  })();

  return (
    <main className="min-h-screen bg-[#0D0F12] text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Fuvest Planner</h1>
              <p className="mt-2 text-zinc-400">
                Organize por <strong>Matéria</strong> → <strong>Assuntos</strong>. Fluxo: 🎥 → 📘 → ❓ + ✍️ Redação
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEssayOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
                title="Abrir Redação"
              >
                <PenSquare className="h-4 w-4" />
                Redação
              </button>
              <button
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4" />
                Adicionar assunto
              </button>
            </div>
          </div>
        </header>

        {/* Busca + Progresso */}
        <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por matéria ou assunto…"
              className="w-full rounded-lg bg-[#12151A] px-10 py-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-zinc-500 focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="rounded-lg border border-white/10 bg-[#12151A] px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
              <span>Progresso geral</span>
              <span className="text-zinc-300 font-medium">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-zinc-300 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Cards por Matéria (recolhíveis) */}
        <div className="grid gap-6">
          {filteredSubjects.map((subject) => {
            const isCollapsed = !!collapsed[subject.id];
            const subjectClass = subject.completed
              ? "rounded-2xl border bg-emerald-950/40 border-emerald-600/30 p-6"
              : "rounded-2xl border border-white/10 bg-[#111418] p-6";
            return (
              <section key={subject.id} className={subjectClass}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCollapse(subject.id)}
                      className="rounded-md p-1.5 text-zinc-300 hover:bg-white/5"
                      title={isCollapsed ? "Expandir" : "Recolher"}
                    >
                      {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    <h2 className="text-2xl font-semibold">{subject.name}</h2>
                    {subject.completed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300 text-xs ring-1 ring-emerald-500/30">
                        <CheckCircle2 className="h-4 w-4" />
                        Concluída
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {subject.completed ? (
                      <button
                        onClick={() => toggleSubjectCompleted(subject.id, false)}
                        className="rounded-md px-3 py-2 text-xs text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/10"
                        title="Desmarcar matéria concluída"
                      >
                        Desmarcar
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleSubjectCompleted(subject.id, true)}
                        className="rounded-md px-3 py-2 text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/5"
                        title="Marcar matéria como concluída"
                      >
                        Marcar como concluída
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setAddOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-zinc-200 hover:bg-white/15"
                      title="Adicionar assunto nesta matéria"
                    >
                      <FolderPlus className="h-4 w-4" />
                      Novo assunto
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <>
                    {subject.topics.length === 0 ? (
                      <p className="text-sm text-zinc-500">Sem assuntos ainda.</p>
                    ) : (
                      <div className="grid gap-4">
                        {subject.topics.map((t) => (
                          <TaskItem
                            key={t.id}
                            task={t}
                            onToggleAction={onToggleAction}
                            onDeleteAction={onDeleteAction}
                            onEditAction={onEditAction}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}

          {filteredSubjects.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma matéria/assunto encontrado.</p>
          )}
        </div>
      </div>

      {/* Dialog: adicionar assunto */}
      <AddEditTaskDialog
        open={addOpen}
        onOpenChangeAction={setAddOpen}
        variant="add"
        onSubmitAction={addSubmit}
      />

      {/* Dialog: editar assunto */}
      <AddEditTaskDialog
        open={editOpen}
        onOpenChangeAction={setEditOpen}
        variant="edit"
        initialSubject={editingTopic?.subjectName}
        initialTopic={editingTopic?.title}
        onSubmitAction={editSubmit}
      />

      {/* Dialog: redação */}
      <EssayDialog open={essayOpen} onOpenChangeAction={setEssayOpen} />
    </main>
  );
}
