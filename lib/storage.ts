export type StudyLink = { label: string; url: string };
export type ResourceBundle = { videos: StudyLink[]; materials: StudyLink[] };

export type Topic = {
  id: string;
  subjectId: string;
  subjectName: string; 
  title: string;       
  completed: boolean;
  resources?: ResourceBundle;
};

export type Subject = {
  id: string;
  name: string;        
  topics: Topic[];
  completed?: boolean; 
};

const KEY_SUBJECTS = "fuvest-planner::subjects";
const LEGACY_TASKS = "fuvest-planner::tasks";

export function loadSubjects(): Subject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw) as Subject[];
      return Array.isArray(parsed) ? parsed : [];
    }
    const legacy = localStorage.getItem(LEGACY_TASKS);
    if (legacy) {
      const tasks = JSON.parse(legacy) as Array<{
        id: string;
        title: string;
        completed: boolean;
        resources?: ResourceBundle;
      }>;
      if (Array.isArray(tasks) && tasks.length) {
        const subjectId = crypto.randomUUID();
        const subjects: Subject[] = [
          {
            id: subjectId,
            name: "Geral",
            topics: tasks.map((t) => ({
              id: t.id,
              subjectId,
              subjectName: "Geral",
              title: t.title,
              completed: t.completed,
              resources: t.resources,
            })),
            completed: false,
          },
        ];
        saveSubjects(subjects);
        return subjects;
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveSubjects(subjects: Subject[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SUBJECTS, JSON.stringify(subjects));
}

export function findSubjectByName(subjects: Subject[], name: string): Subject | undefined {
  const n = name.trim().toLowerCase();
  return subjects.find((s) => s.name.trim().toLowerCase() === n);
}
