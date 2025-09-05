export type StudyLink = { label: string; url: string };
export type ResourceBundle = { videos: StudyLink[]; materials: StudyLink[] };

export type StoredTask = {
  id: string;
  title: string;
  completed: boolean;
  resources?: ResourceBundle;
};

const KEY = "fuvest-planner::tasks";

export function loadTasks(): StoredTask[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as StoredTask[]) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: StoredTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
