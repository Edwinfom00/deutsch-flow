export interface ArticleRule {
  suffix: string;
  article: "der" | "die" | "das";
  rule: string;
  examples: string[];
  exceptions?: string[];
  color: string;
  reliability: "toujours" | "souvent" | "tendance";
}

export const ARTICLE_RULES: ArticleRule[] = [
  {
    suffix: "-ung",
    article: "die",
    rule: "Les noms en -ung sont toujours féminins",
    examples: ["die Wohnung", "die Zeitung", "die Meinung", "die Lösung", "die Übung"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-heit",
    article: "die",
    rule: "Les noms en -heit sont toujours féminins",
    examples: ["die Freiheit", "die Gesundheit", "die Schönheit", "die Wahrheit"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-keit",
    article: "die",
    rule: "Les noms en -keit sont toujours féminins",
    examples: ["die Möglichkeit", "die Schwierigkeit", "die Freundlichkeit", "die Einigkeit"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-schaft",
    article: "die",
    rule: "Les noms en -schaft sont toujours féminins",
    examples: ["die Freundschaft", "die Gesellschaft", "die Wirtschaft", "die Mannschaft"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-ion",
    article: "die",
    rule: "Les noms en -ion sont toujours féminins",
    examples: ["die Nation", "die Situation", "die Information", "die Produktion"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-tät",
    article: "die",
    rule: "Les noms en -tät sont toujours féminins",
    examples: ["die Qualität", "die Universität", "die Realität", "die Aktivität"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-ik",
    article: "die",
    rule: "Les noms en -ik sont généralement féminins",
    examples: ["die Musik", "die Technik", "die Politik", "die Physik"],
    exceptions: ["der Atlantik", "das Mosaik"],
    color: "red",
    reliability: "souvent",
  },
  {
    suffix: "-in",
    article: "die",
    rule: "Les noms féminins de personnes en -in",
    examples: ["die Lehrerin", "die Ärztin", "die Freundin", "die Kollegin"],
    color: "red",
    reliability: "toujours",
  },
  {
    suffix: "-er",
    article: "der",
    rule: "Les noms de personnes/agents en -er sont masculins",
    examples: ["der Lehrer", "der Computer", "der Drucker", "der Fehler"],
    exceptions: ["die Mutter", "die Schwester", "das Wasser", "das Zimmer"],
    color: "blue",
    reliability: "souvent",
  },
  {
    suffix: "-ismus",
    article: "der",
    rule: "Les noms en -ismus sont toujours masculins",
    examples: ["der Tourismus", "der Kapitalismus", "der Realismus", "der Optimismus"],
    color: "blue",
    reliability: "toujours",
  },
  {
    suffix: "-ist",
    article: "der",
    rule: "Les noms de personnes en -ist sont masculins",
    examples: ["der Journalist", "der Optimist", "der Spezialist", "der Tourist"],
    color: "blue",
    reliability: "toujours",
  },
  {
    suffix: "-or",
    article: "der",
    rule: "Les noms en -or sont généralement masculins",
    examples: ["der Motor", "der Doktor", "der Faktor", "der Sektor"],
    color: "blue",
    reliability: "souvent",
  },
  {
    suffix: "-ant",
    article: "der",
    rule: "Les noms de personnes en -ant sont masculins",
    examples: ["der Praktikant", "der Demonstrant", "der Lieferant"],
    color: "blue",
    reliability: "souvent",
  },
  {
    suffix: "-chen",
    article: "das",
    rule: "Les diminutifs en -chen sont toujours neutres",
    examples: ["das Mädchen", "das Häuschen", "das Brötchen", "das Kätzchen"],
    color: "green",
    reliability: "toujours",
  },
  {
    suffix: "-lein",
    article: "das",
    rule: "Les diminutifs en -lein sont toujours neutres",
    examples: ["das Büchlein", "das Fräulein", "das Männlein", "das Vöglein"],
    color: "green",
    reliability: "toujours",
  },
  {
    suffix: "-ment",
    article: "das",
    rule: "Les noms en -ment sont généralement neutres",
    examples: ["das Dokument", "das Instrument", "das Experiment", "das Argument"],
    exceptions: ["der Zement", "der Moment"],
    color: "green",
    reliability: "souvent",
  },
  {
    suffix: "-tum",
    article: "das",
    rule: "Les noms en -tum sont généralement neutres",
    examples: ["das Wachstum", "das Eigentum", "das Altertum"],
    exceptions: ["der Irrtum", "der Reichtum"],
    color: "green",
    reliability: "souvent",
  },
  {
    suffix: "-um",
    article: "das",
    rule: "Les noms latins en -um sont neutres",
    examples: ["das Datum", "das Museum", "das Zentrum", "das Gymnasium"],
    color: "green",
    reliability: "souvent",
  },
];

export const ARTICLE_COLORS = {
  der: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500", dot: "bg-blue-400" },
  die: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-500", dot: "bg-red-400" },
  das: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-500", dot: "bg-emerald-400" },
};

export const RELIABILITY_LABELS = {
  toujours: { label: "Toujours", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  souvent: { label: "Souvent", color: "text-amber-600 bg-amber-50 border-amber-200" },
  tendance: { label: "Tendance", color: "text-gray-500 bg-gray-50 border-gray-200" },
};
