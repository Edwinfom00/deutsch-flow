import type {
  OsdA2HeadlineTextMatching,
  OsdA2LongTextMC,
  OsdA2WetterMultiSelect,
  OsdA2HoerenInterviewMulti,
  OsdA2HoerenNotizen,
  OsdA2EmailAntwort,
} from "../types/osd-a2.types";

export const mockA2HeadlineTextMatching: OsdA2HeadlineTextMatching = {
  type: "OSD_A2_HEADLINE_TEXT_MATCHING",
  instructions:
    "Lisez les 10 titres puis les 5 textes. Pour chaque texte, trouvez le titre qui correspond. Un seul titre est correct par texte.",
  headlines: [
    { letter: "A", text: "Jetzt das Fahrrad reparieren lassen" },
    { letter: "B", text: "Im Rathaus: Informationen über Tiere" },
    { letter: "C", text: "Tipp: Ausflug in den Tierpark" },
    { letter: "D", text: "Frühlingspflanzen im Sonderangebot" },
    { letter: "E", text: "Tipps fürs Radfahren in der Stadt" },
    { letter: "F", text: "Radfahren ist gesund!" },
    { letter: "G", text: "Mit neuen Pflanzen in den Frühling" },
    { letter: "H", text: "Haustiere machen krank" },
    { letter: "I", text: "Ausstellung: Blumen im Frühling" },
    { letter: "K", text: "Wiener wurden zum Radfahren befragt" },
  ],
  texts: [
    {
      number: 1,
      content:
        "Seit Jahrzehnten ist der Oberberger Tierpark ein beliebtes Ausflugsziel. Die Vielfalt der Tiere und Pflanzen und die wunderbare Naturlandschaft sind die Gründe dafür. Das Angebot ist vielfältig: Führungen, Tierfütterungen, Naturlehrpfad, Waldspielplätze und vieles mehr. Info-Telefon 804 31 69",
      source: "aus einer deutschen Zeitung",
      correctHeadline: "C",
    },
    {
      number: 2,
      content:
        "Fahrrad fahren in Hamburg liegt voll im Trend. Das Fahrrad hat sich im Stadtgebiet heute einen wichtigen Platz erobert. Mehr als 1 000 Kilometer an Radwegen sollen Sie animieren, umzusteigen und das Fahrrad (neu) zu entdecken. Was Sie dabei beachten müssen, aber auch Tipps zu interessanten Routen – das finden Sie unter www.hamburg.de/verkehr/radfahren.",
      source: "aus einer deutschen Tageszeitung",
      correctHeadline: "E",
    },
    {
      number: 3,
      content:
        'An Werktagen nützen 37 Prozent der Wiener ihr Rad in der Freizeit, aber auch für Wege in die Arbeit oder zur Schule/Uni ist das Rad ein beliebtes Verkehrsmittel. Das ging aus den Antworten auf eine Interview-Reihe zum Thema „Mit dem Fahrrad in Wien" hervor.',
      source: "aus einer österreichischen Zeitung",
      correctHeadline: "K",
    },
    {
      number: 4,
      content:
        "Die aktuelle Ausstellung im Rathaus bietet Wissenswertes über Tierschutz und Tierhaltung. Für Kinder gibt es die Möglichkeit, verschiedene Haustiere kennenzulernen und sich über das Zusammenleben mit ihnen zu informieren. Der Eintritt ist frei! Informationen: www.tierschutzinbern.ch",
      source: "aus einer Schweizer Zeitung",
      correctHeadline: "B",
    },
    {
      number: 5,
      content:
        '„Unsere Stadt blüht auf!" Das ist unser Motto für den Frühling und alle sind eingeladen, mitzumachen: Egal ob Sie neue Sträucher, Bäume oder Blumen am Fenster pflanzen – mehr Natur tut allen gut! Schicken Sie ein Foto von Ihren Frühlingspflanzen an das Gemeindeamt und gewinnen Sie einen Einkaufsgutschein im Wert von 50 Euro.',
      source: "aus einer österreichischen Tageszeitung",
      correctHeadline: "G",
    },
  ],
};

export const mockA2LongTextMC: OsdA2LongTextMC = {
  type: "OSD_A2_LONG_TEXT_MC",
  instructions:
    "Lisez d'abord le texte. Pour chaque question (1–5), choisissez la bonne réponse (A, B ou C).",
  textTitle: "65 Jahre ohne ernsten Streit",
  textSource: "aus einer österreichischen Zeitung",
  text:
    'Dass sich zwei Menschen, die schon 65 Jahre verheiratet sind und einander stets treu waren, nach so langer Zeit immer noch lieben und achten wie am ersten Tag, ist doch etwas sehr Außergewöhnliches.\n\nFranz und Hanna Böhm aus Linz sind ein solches Paar. „Liebe auf den ersten Blick war es nicht", meint der 88-jährige Franz Böhm und lacht, „denn ich habe ihr anfangs gar nicht gefallen." Damals war seine Hanna 19 Jahre alt und „hatte es schon recht eilig", endlich zu heiraten. Heute ist Hanna Böhm 84 und glücklich, dass ihr Franz sie doch noch erobert hat.\n\nEr hat als Matrose auf einem Donauschiff gearbeitet, sie war die Tochter seines Chefs, des Steuermannes. Und als er erzählt, wie er einmal eine Frau aus dem Wasser geholt und so vor dem Ertrinken gerettet hat, da merkt man, wie stolz seine Ehefrau auf ihn ist.\n\nEigene Kinder haben die beiden leider nie bekommen, dafür haben sie ihren Neffen, den Sohn von Hannas Schwester, zu sich genommen und liebevoll erzogen.\n\nGemeinsame Spaziergänge am Pöstlingberg in der Nähe von Linz halten das rüstige Paar jung und fit – und natürlich auch ihre Liebe zueinander, die all die Jahre in guten wie in schlechten Zeiten bis heute andauert.',
  beispiel: {
    question: "Herr und Frau Böhm sind",
    options: [
      { id: "A", text: "65 Jahre alt." },
      { id: "B", text: "84 Jahre lang befreundet." },
      { id: "C", text: "seit 65 Jahren ein Ehepaar." },
    ],
    correctId: "C",
  },
  questions: [
    {
      number: 1,
      question: "Herr Böhm ist",
      options: [
        { id: "A", text: "65 Jahre alt." },
        { id: "B", text: "84 Jahre alt." },
        { id: "C", text: "88 Jahre alt." },
      ],
      correctId: "C",
    },
    {
      number: 2,
      question: "Franz Böhm",
      options: [
        { id: "A", text: "hat auf einem Schiff gearbeitet." },
        { id: "B", text: "hat ein Schiff gekauft." },
        { id: "C", text: "wollte auf einem Schiff arbeiten." },
      ],
      correctId: "A",
    },
    {
      number: 3,
      question: "Franz Böhm hat",
      options: [
        { id: "A", text: "einer Frau in Not geholfen." },
        { id: "B", text: "seine Frau oft auf dem Schiff mitfahren lassen." },
        { id: "C", text: "seinem Chef geholfen." },
      ],
      correctId: "A",
    },
    {
      number: 4,
      question: "Das Paar hat",
      options: [
        { id: "A", text: "einen Neffen bei sich aufgenommen." },
        { id: "B", text: "einen Sohn bekommen." },
        { id: "C", text: "viele Kinder bekommen." },
      ],
      correctId: "A",
    },
    {
      number: 5,
      question: "Das Ehepaar",
      options: [
        { id: "A", text: "bleibt durch Spazierengehen jung." },
        { id: "B", text: "geht oft im Stadtzentrum von Linz spazieren." },
        { id: "C", text: "ist früher gern spazieren gegangen." },
      ],
      correctId: "A",
    },
  ],
};

export const mockA2WetterMultiSelect: OsdA2WetterMultiSelect = {
  type: "OSD_A2_WETTER_MULTI_SELECT",
  instructions:
    "Vous entendez deux textes avec le même contenu. Écoutez bien et cochez les bonnes réponses. Il y a quatre bonnes réponses. Attention : si vous cochez 5 réponses, vous perdez 3 points ; plus de 5 réponses = 0 point.",
  topic: "Das Wetter am Wochenende",
  script:
    "Und nun zum Wetter am Wochenende: Am Samstag erwartet uns viel Sonne im Süden, aber Achtung — am Nachmittag können auch heftige Gewitter aufziehen. Die Temperaturen klettern auf bis zu 25 Grad. Allerdings bleibt es windig, besonders an der Küste. Am Sonntag bleibt es weiterhin sonnig.",
  options: ["Sonne", "Gewitter", "18 Grad", "Regen", "Nebel", "Wind", "25 Grad", "Wolken"],
  correctOptions: ["Sonne", "Gewitter", "Wind", "25 Grad"],
  expectedSelectionCount: 4,
};

export const mockA2HoerenNotizen: OsdA2HoerenNotizen = {
  type: "OSD_A2_HOEREN_NOTIZEN",
  instructions:
    "Vous entendez le message suivant. Écoutez bien et écrivez les informations les plus importantes sur le bloc-notes (Abschlussfeier). Vous entendez le texte deux fois.",
  script:
    "Hallo zusammen, hier ist die Kursleitung. Wir feiern unsere Abschlussfeier am letzten Kurstag, das ist am Freitag, dem 19. Juli. Jeder bringt bitte etwas zum Essen mit — wir hatten an Salat gedacht, das passt gut zum Buffet. Für die Getränke sammeln wir 2 Euro pro Person. Bei Fragen ruft mich bitte unter der Nummer 734 56 82 an. Bis bald!",
  notes: [
    {
      id: "letzter_kurstag",
      label: "Letzter Kurstag:",
      placeholder: "Tag",
      correctAnswer: "Freitag",
      acceptedVariants: ["Freitag", "Fr.", "Fr"],
    },
    {
      id: "zum_essen",
      label: "Zum Essen mitnehmen:",
      placeholder: "Plat",
      correctAnswer: "Salat",
      acceptedVariants: ["Salat", "einen Salat"],
    },
    {
      id: "fuer_getraenke",
      label: "Für Getränke: Euro",
      placeholder: "Montant",
      correctAnswer: "2",
      acceptedVariants: ["2", "zwei", "2 Euro"],
    },
    {
      id: "datum",
      label: "Datum: 19/",
      placeholder: "Mois",
      correctAnswer: "7",
      acceptedVariants: ["7", "Juli"],
    },
    {
      id: "telefon",
      label: "Telefonnummer:",
      placeholder: "Numéro",
      correctAnswer: "734 56 82",
      acceptedVariants: ["734 56 82", "7345682", "734-56-82"],
    },
  ],
};

export const mockA2HoerenInterviewMulti: OsdA2HoerenInterviewMulti = {
  type: "OSD_A2_HOEREN_INTERVIEW_MULTI",
  instructions:
    "Vous entendez un interview avec 5 personnes. Écoutez bien et cochez les bonnes réponses pour chaque personne. Plusieurs réponses sont possibles par personne.",
  question: "Welchen Sport betreiben Sie in Ihrer Freizeit?",
  columns: ["Fußball", "Tennis", "Laufen", "Schwimmen", "Radfahren"],
  speakers: [
    {
      number: 1,
      label: "Sprecherin 1",
      script:
        "Also ich laufe regelmäßig im Park und gehe mindestens zweimal pro Woche ins Schwimmbad. Das hält mich fit und entspannt.",
      correctColumnIndices: [2, 3],
    },
    {
      number: 2,
      label: "Sprecher 2",
      script:
        "Mein Hobby ist Fußball, das spiele ich seit meiner Kindheit. Im Sommer fahre ich aber auch oft mit dem Rad zur Arbeit.",
      correctColumnIndices: [0, 4],
    },
    {
      number: 3,
      label: "Sprecherin 3",
      script:
        "Ich spiele Tennis im Verein und gehe gerne laufen, wenn das Wetter schön ist.",
      correctColumnIndices: [1, 2],
    },
    {
      number: 4,
      label: "Sprecher 4",
      script:
        "Bei mir ist es einfach: Radfahren, Radfahren, Radfahren. Ich liebe Touren am Wochenende.",
      correctColumnIndices: [4],
    },
    {
      number: 5,
      label: "Sprecherin 5",
      script:
        "Ich bin Schwimmerin, mache aber auch Yoga und manchmal joggen. Ja, Laufen also.",
      correctColumnIndices: [2, 3],
    },
  ],
};

export const mockA2EmailAntwort: OsdA2EmailAntwort = {
  type: "OSD_A2_EMAIL_ANTWORT",
  instructions:
    "Vous recevez un e-mail de votre ami Michael. Répondez en environ 50 mots. Répondez à toutes les questions et écrivez un salut à la fin.",
  scenario:
    "Votre ami Michael vous écrit qu'il part en voyage en Autriche et veut vous revoir à son retour.",
  receivedEmail: {
    from: "michael.morris@hotmail.com",
    subject: "Reise",
    body:
      "Liebe/Lieber …,\n\nwie geht es dir? Stell dir vor, ich fahre nächste Woche nach Österreich. Dort werde ich Wien, Salzburg und Innsbruck besuchen. Ich freue mich sehr darauf. Hast du schon einmal eine Reise gemacht? Wohin bist du gefahren? Was gibt es bei dir Neues?\n\nWir haben uns so lange nicht mehr gesehen. Nach meiner Reise müssen wir uns unbedingt treffen. Dann zeige ich dir auch meine Fotos.\n\nWann hast du Zeit?\n\nBis bald und liebe Grüße\nMichael",
  },
  responsePoints: [
    "Wie geht es dir?",
    "Hast du schon einmal eine Reise gemacht? Wohin bist du gefahren?",
    "Was gibt es bei dir Neues?",
    "Wann hast du Zeit?",
  ],
  minWords: 45,
  maxWords: 70,
};

export const ALL_A2_MOCKS = [
  mockA2HeadlineTextMatching,
  mockA2LongTextMC,
  mockA2WetterMultiSelect,
  mockA2HoerenNotizen,
  mockA2HoerenInterviewMulti,
  mockA2EmailAntwort,
] as const;
