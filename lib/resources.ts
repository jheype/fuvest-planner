export type StudyLink = { label: string; url: string };
export type ResourceBundle = { videos: StudyLink[]; materials: StudyLink[] };

type Rule = {
  keywords: (string | RegExp)[];
  resources: ResourceBundle;
};

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const ka = (path: string) =>
  `https://pt.khanacademy.org/${path.replace(/^\/+/, "")}`;

const RULES: Rule[] = [
  // ===== MATEMÁTICA =====
  {
    keywords: [/equac(ões|oes)? do 2(º|o) grau/i, /fun(ç|c)ão quadrát/i, /v[ée]rtice|delta|Δ/i],
    resources: {
      videos: [
        { label: "Equações do 2º grau (Δ, raízes) — YouTube", url: yt("equações do 2º grau fuvest resolução") },
        { label: "Função quadrática (gráfico e vértice) — YouTube", url: yt("função quadrática gráfico vértice fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Quadráticas", url: ka("math/algebra/quadratics") },
        { label: "Mundo Educação — Equação do 2º grau", url: "https://mundoeducacao.uol.com.br/matematica/equacao-2-grau.htm" },
      ],
    },
  },
]


// Resolver recursos a partir do título
export function getResources(title: string): ResourceBundle {
  const t = title.toLowerCase();
  for (const rule of RULES) {
    const hit = rule.keywords.some((k) =>
      typeof k === "string" ? t.includes(k.toLowerCase()) : (k as RegExp).test(t)
    );
    if (hit) return rule.resources;
  }
  // Fallback: buscas genéricas pelo título completo
  return {
    videos: [
      { label: "YouTube — videoaulas sobre o tema", url: yt(`${title} FUVEST ENEM`) },
      { label: "YouTube — exercícios resolvidos", url: yt(`${title} exercícios resolvidos`) },
    ],
    materials: [
      { label: "Khan Academy — pesquisa", url: `https://pt.khanacademy.org/search?page_search_query=${encodeURIComponent(title)}` },
      { label: "Google Acadêmico — materiais", url: `https://scholar.google.com/scholar?hl=pt-BR&q=${encodeURIComponent(title)}` },
    ],
  };
}
