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
  {
    keywords: [/conjuntos|intervalos/i],
    resources: {
      videos: [
        { label: "Conjuntos e operações — YouTube", url: yt("conjuntos operações matemática fuvest") },
        { label: "Intervalos reais na reta — YouTube", url: yt("intervalos reais notação fuvest") },
      ],
      materials: [
        { label: "Brasil Escola — Conjuntos", url: "https://brasilescola.uol.com.br/matematica/conjuntos.htm" },
        { label: "Khan Academy — Fundamentos", url: ka("math/geometry/hs-geo-foundations") },
      ],
    },
  },
  {
    keywords: [/fun(ç|c)(ão|oes)? afim|fun(ç|c)(ões)?\b/i],
    resources: {
      videos: [
        { label: "Função afim: coeficientes e gráfico — YouTube", url: yt("função afim coeficientes gráfico fuvest") },
        { label: "Domínio e imagem — YouTube", url: yt("domínio e imagem função fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Funções", url: ka("math/algebra/x2f8bb11595b61c86:functions") },
        { label: "Stoodi — Função Afim (resumo)", url: "https://www.stoodi.com.br/materias/matematica/funcao-afim/" },
      ],
    },
  },
  {
    keywords: [/pa\/?pg|progress(ões|oes) arit|geom(étricas|etricas)/i],
    resources: {
      videos: [
        { label: "PA e PG — teoria/questões — YouTube", url: yt("PA PG fuvest questões") },
        { label: "Soma de termos — YouTube", url: yt("soma dos termos PA PG fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Sequências (PA/PG)", url: ka("math/algebra/sequences") },
        { label: "Brasil Escola — Progressões", url: "https://brasilescola.uol.com.br/matematica/progressao-aritmetica.htm" },
      ],
    },
  },
  {
    keywords: [/logaritmos?/i],
    resources: {
      videos: [
        { label: "Logaritmos: propriedades — YouTube", url: yt("logaritmos propriedades fuvest") },
        { label: "Equações logarítmicas — YouTube", url: yt("equações logarítmicas fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Logaritmos", url: ka("math/algebra2/exponential-and-logarithmic-functions") },
        { label: "Mundo Educação — Logaritmos", url: "https://mundoeducacao.uol.com.br/matematica/logaritmos.htm" },
      ],
    },
  },
  {
    keywords: [/trigonometria|lei dos senos|lei dos cossenos/i],
    resources: {
      videos: [
        { label: "Trigonometria no triângulo — YouTube", url: yt("lei dos senos lei dos cossenos fuvest") },
        { label: "Razões trigonométricas — YouTube", url: yt("razões trigonométricas triângulo fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Trigonometria", url: ka("math/trigonometry") },
        { label: "Brasil Escola — Lei dos Senos", url: "https://brasilescola.uol.com.br/matematica/lei-dos-senos.htm" },
      ],
    },
  },
  {
    keywords: [/geometria plana|áreas|semelhança|polígonos/i],
    resources: {
      videos: [
        { label: "Geometria plana: áreas/semelhança — YouTube", url: yt("geometria plana áreas semelhança fuvest") },
        { label: "Polígonos notáveis — YouTube", url: yt("polígonos semelhança fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Geometria", url: ka("math/geometry") },
        { label: "Mundo Educação — Semelhança", url: "https://mundoeducacao.uol.com.br/matematica/semelhanca-triangulos.htm" },
      ],
    },
  },
  {
    keywords: [/geometria espacial|prismas|cilindros|cones|esferas/i],
    resources: {
      videos: [
        { label: "Geometria espacial: volumes — YouTube", url: yt("geometria espacial volumes prismas cilindros cones esferas fuvest") },
        { label: "Áreas lateral/total — YouTube", url: yt("área lateral total cilindro cone fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Sólidos", url: ka("math/geometry/hs-geo-solids") },
        { label: "Brasil Escola — Geometria espacial", url: "https://brasilescola.uol.com.br/matematica/geometria-espacial.htm" },
      ],
    },
  },
  {
    keywords: [/contagem|probabilid/i],
    resources: {
      videos: [
        { label: "Princípios de contagem — YouTube", url: yt("princípio fundamental da contagem fuvest") },
        { label: "Probabilidade básica — YouTube", url: yt("probabilidade exercícios fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Probabilidade", url: ka("math/statistics-probability/probability-library") },
        { label: "Mundo Educação — Probabilidade", url: "https://mundoeducacao.uol.com.br/matematica/probabilidade.htm" },
      ],
    },
  },

  // ===== FÍSICA =====
  {
    keywords: [/cinemát(ic|)a|mruv?|lançamentos?/i],
    resources: {
      videos: [
        { label: "MRU/MRUV — gráficos — YouTube", url: yt("mru mruv gráficos fuvest") },
        { label: "Lançamento oblíquo — YouTube", url: yt("lançamento oblíquo alcance altura fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Cinemática", url: ka("science/physics/one-dimensional-motion") },
        { label: "Brasil Escola — MRU/MRUV", url: "https://brasilescola.uol.com.br/fisica/movimento-uniforme.htm" },
      ],
    },
  },
  {
    keywords: [/leis de newton|atrito/i],
    resources: {
      videos: [
        { label: "Leis de Newton — exercícios — YouTube", url: yt("leis de newton fuvest exercícios atrito") },
        { label: "Blocos e planos inclinados — YouTube", url: yt("atrito planos inclinados blocos fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Forças/Newton", url: ka("science/physics/forces-newtonian-mechanics") },
        { label: "Mundo Educação — Atrito", url: "https://mundoeducacao.uol.com.br/fisica/forca-de-atrito.htm" },
      ],
    },
  },
  {
    keywords: [/trabalho.*energia|pot(ê|e)ncia/i],
    resources: {
      videos: [
        { label: "Trabalho/Energia — YouTube", url: yt("trabalho energia potência fuvest") },
        { label: "Conservação de energia — YouTube", url: yt("conservação de energia mecânica fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Trabalho/Energia", url: ka("science/physics/work-and-energy") },
        { label: "Brasil Escola — Energia mecânica", url: "https://brasilescola.uol.com.br/fisica/energia-mecanica.htm" },
      ],
    },
  },

  // ===== QUÍMICA =====
  {
    keywords: [/estrutura at(ô|o)mica|tabela peri(ó|o)dica|liga(ç|c)ões/i],
    resources: {
      videos: [
        { label: "Estrutura atômica — YouTube", url: yt("estrutura atômica níveis subníveis fuvest") },
        { label: "Ligações químicas — YouTube", url: yt("ligações iônicas covalentes metálicas fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Propriedades atômicas", url: ka("science/chemistry/atomic-structure-and-properties") },
        { label: "Brasil Escola — Ligações químicas", url: "https://brasilescola.uol.com.br/quimica/ligacoes-quimicas.htm" },
      ],
    },
  },
  {
    keywords: [/estequiometria|reagente limitante/i],
    resources: {
      videos: [
        { label: "Estequiometria — YouTube", url: yt("estequiometria exercícios fuvest") },
        { label: "Reagente limitante — YouTube", url: yt("reagente limitante fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Estequiometria", url: ka("science/chemistry/chemical-reactions-stoichiome") },
        { label: "Mundo Educação — Estequiometria", url: "https://mundoeducacao.uol.com.br/quimica/estequiometria.htm" },
      ],
    },
  },

  // ===== BIOLOGIA =====
  {
    keywords: [/citologia|organelas|transporte de membrana/i],
    resources: {
      videos: [
        { label: "Citologia — YouTube", url: yt("citologia organelas transporte membrana fuvest") },
        { label: "Membrana plasmática — YouTube", url: yt("membrana plasmática transporte fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Células", url: ka("science/biology/structure-of-a-cell") },
        { label: "Brasil Escola — Organelas", url: "https://brasilescola.uol.com.br/biologia/organela-celular.htm" },
      ],
    },
  },
  {
    keywords: [/mendel|gen(é|e)tica/i],
    resources: {
      videos: [
        { label: "Leis de Mendel — YouTube", url: yt("leis de mendel diibridismo fuvest") },
        { label: "Probabilidade em genética — YouTube", url: yt("probabilidade genética fuvest") },
      ],
      materials: [
        { label: "Khan Academy — Genética", url: ka("science/biology/classical-genetics") },
        { label: "Mundo Educação — Leis de Mendel", url: "https://mundoeducacao.uol.com.br/biologia/leis-mendel.htm" },
      ],
    },
  },

  // ===== HISTÓRIA / GEOGRAFIA / PORTUGUÊS (alguns exemplos) =====
  {
    keywords: [/revolu(ç|c)ão francesa/i],
    resources: {
      videos: [
        { label: "Revolução Francesa — YouTube", url: yt("revolução francesa fuvest") },
        { label: "Período do Terror — YouTube", url: yt("revolução francesa período do terror fuvest") },
      ],
      materials: [
        { label: "Brasil Escola — Revolução Francesa", url: "https://brasilescola.uol.com.br/historia/revolucao-francesa.htm" },
        { label: "Mundo Educação — Fases", url: "https://mundoeducacao.uol.com.br/historiageral/revolucao-francesa.htm" },
      ],
    },
  },
  {
    keywords: [/classes de palavras|morfologia|ortografia/i],
    resources: {
      videos: [
        { label: "Classes de palavras — YouTube", url: yt("classes de palavras morfologia fuvest") },
        { label: "Ortografia — YouTube", url: yt("ortografia dicas fuvest") },
      ],
      materials: [
        { label: "Gramática — Morfologia", url: "https://www.normaculta.com.br/categoria/morfologia/" },
        { label: "Tudo Enem — Ortografia", url: "https://www.tudoenem.com.br/ortografia/" },
      ],
    },
  },
];

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
