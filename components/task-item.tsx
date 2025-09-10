"use client";

import { useMemo, useState } from "react";
import { PlayCircle, BookOpen, HelpCircle, Shield, Pencil, Trash2, Undo2, CheckCircle2 } from "lucide-react";
import { QuizDialog } from "./quiz-dialog";
import { getResources } from "../lib/resources";
import type { ResourceBundle } from "../lib/storage";

type Step = "video" | "material" | "quiz";

export function TaskItem({
  task,
  onToggleAction,
  onDeleteAction,
  onEditAction,
}: {
  task: {
    id: string;
    subjectId: string;
    subjectName: string;
    title: string; 
    completed: boolean;
    resources?: ResourceBundle;
  };
  onToggleAction: (id: string, next: boolean) => Promise<void>;
  onDeleteAction: (id: string) => Promise<void>;
  onEditAction: (id: string) => void;
}) {
  const [completed, setCompleted] = useState(task.completed);
  const [current, setCurrent] = useState<Step>("video");
  const [watched, setWatched] = useState(false);
  const [openQuiz, setOpenQuiz] = useState(false);

  const RES = useMemo<ResourceBundle>(() => {
    if (task.resources?.videos?.length || task.resources?.materials?.length) {
      return {
        videos: task.resources.videos ?? [],
        materials: task.resources.materials ?? [],
      };
    }
    return getResources(`${task.subjectName} — ${task.title}`);
  }, [task]);

  const allowQuiz = watched;

  const markFinished = async () => {
    setCompleted(true);
    await onToggleAction(task.id, true);
  };

  const unfinish = async () => {
    setCompleted(false);
    await onToggleAction(task.id, false);
  };

  const doDelete = async () => {
    const ok = window.confirm("Deseja remover este assunto?");
    if (!ok) return;
    await onDeleteAction(task.id);
  };

  const containerClass = completed
    ? "rounded-2xl border bg-emerald-950/40 border-emerald-600/30 p-6"
    : "rounded-2xl border border-white/10 bg-[#111418] p-6";

  return (
    <div className={containerClass}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
            <Shield className="h-3.5 w-3.5 text-zinc-500" />
            <span>{task.subjectName}</span>
          </div>
          <h3 className="mt-1 text-xl font-semibold text-zinc-100 leading-snug">
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {completed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-emerald-300 text-xs ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
              Concluído
            </span>
          ) : null}

          {completed ? (
            <button
              onClick={unfinish}
              className="rounded-md p-2 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
              title="Desmarcar concluído"
            >
              <Undo2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={markFinished}
              className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              title="Marcar assunto como concluído"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onEditAction(task.id)}
            className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={doDelete}
            className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!completed && (
        <>
          {/* Steps */}
          <div className="flex flex-wrap items-center gap-2">
            <StepPill active={current === "video"} icon={PlayCircle} label="Videoaulas" onClick={() => setCurrent("video")} />
            <StepPill active={current === "material"} disabled={!watched} icon={BookOpen} label="Material" onClick={() => setCurrent("material")} />
            <StepPill
              active={current === "quiz"}
              disabled={!allowQuiz}
              icon={HelpCircle}
              label="Questões"
              onClick={() => {
                if (!allowQuiz) return;
                setCurrent("quiz");
                setOpenQuiz(true);
              }}
            />
          </div>

          {/* Conteúdo */}
          <div className="mt-5 grid gap-4">
            {current === "video" && (
              <div className="rounded-lg border border-white/10 bg-[#0F1216] p-4">
                <p className="mb-3 text-sm text-zinc-300">Assista pelo menos uma videoaula:</p>
                <ul className="space-y-2 text-sm">
                  {(RES.videos.length ? RES.videos : [
                    { label: "YouTube — videoaulas sobre o tema", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(task.subjectName + " " + task.title + " FUVEST ENEM")}` },
                  ]).map((v, i) => (
                    <li key={i}>
                      <a
                        className="block rounded-md bg-[#0D1014] px-3 py-2 ring-1 ring-white/10 hover:bg-white/5 transition"
                        target="_blank"
                        rel="noreferrer"
                        href={v.url}
                      >
                        ▶️ {v.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setWatched(true); setCurrent("material"); }}
                  className="mt-4 rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-zinc-700 transition"
                >
                  ✔️ Marcar 1 videoaula assistida
                </button>
              </div>
            )}

            {current === "material" && (
              <div className="rounded-lg border border-white/10 bg-[#0F1216] p-4">
                <p className="mb-3 text-sm text-zinc-300">Materiais recomendados:</p>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                  {(RES.materials.length ? RES.materials : [
                    { label: "Khan Academy — pesquisa", url: `https://pt.khanacademy.org/search?page_search_query=${encodeURIComponent(task.subjectName + " " + task.title)}` },
                  ]).map((m, i) => (
                    <li key={i}>
                      <a
                        className="block rounded-md bg-[#0D1014] px-3 py-2 ring-1 ring-white/10 hover:bg-white/5 transition"
                        target="_blank"
                        rel="noreferrer"
                        href={m.url}
                      >
                        📘 {m.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quiz */}
          <QuizDialog
            open={openQuiz}
            onOpenChangeAction={setOpenQuiz}
            topic={`${task.subjectName} — ${task.title}`}
            onFinishAction={markFinished}
          />
        </>
      )}
    </div>
  );
}

function StepPill({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition",
        "ring-1",
        disabled
          ? "cursor-not-allowed opacity-60 ring-white/10 text-zinc-500"
          : active
          ? "bg-[#0F1216] ring-white/10 text-zinc-100"
          : "bg-transparent ring-white/10 text-zinc-400 hover:bg-white/5",
      ].join(" ")}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
