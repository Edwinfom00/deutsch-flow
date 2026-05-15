import type {
  OsdA1SituationAnzeige,
  OsdA1JaNeinPerAnzeige,
  OsdA1TextBild,
  OsdA1HoerenAudioFoto,
  OsdA1HoerenNotizen,
  OsdA1HoerenInterviewSingleChoice,
  OsdA1Formular,
  OsdA1EmailAntwort,
} from "../types/osd-a1.types";

export const mockA1SituationAnzeige: OsdA1SituationAnzeige = {
  type: "OSD_A1_SITUATION_ANZEIGE",
  instructions:
    "Vous cherchez différentes choses dans le journal. Pour chaque situation (A–E), trouvez l'annonce correspondante (1–6). Attention : il y a une annonce de trop.",
  situations: [
    {
      letter: "A",
      text: "Sie haben viele Freunde in anderen Ländern und möchten billig mit ihnen telefonieren.",
      correctAnzeige: 4,
    },
    {
      letter: "B",
      text: "Sie sollen für ein Fest etwas zum Essen mitbringen. Sie haben keine Zeit zum Kochen.",
      correctAnzeige: 6,
    },
    {
      letter: "C",
      text: "Sie suchen einen Job. Sie wollen in einem Büro arbeiten.",
      correctAnzeige: 1,
    },
    {
      letter: "D",
      text: "Sie haben eine große Wohnung. Sie brauchen Hilfe bei der Hausarbeit.",
      correctAnzeige: 5,
    },
    {
      letter: "E",
      text: "Sie arbeiten viel am Computer. In Ihrer Freizeit möchten Sie Sport machen.",
      correctAnzeige: 2,
    },
  ],
  anzeigen: [
    {
      number: 1,
      title: "Sekretärin/Sekretär gesucht",
      text: "Internationale Firma sucht Sekretärin/Sekretär mit Berufserfahrung (Vollzeit). Aufgaben: telefonische Kundenbetreuung, organisatorische Tätigkeiten. Bewerbungen an: info@personalvermittlung-holzer.de",
    },
    {
      number: 2,
      title: "Fitnesscenter Olymp",
      text: "Unser Angebot: 120 Geräte für Kraft- und Fitnesstraining, Rückengymnastik, Beratung durch geprüfte Trainer. Burggasse 10, 1070 Wien. Täglich 10–22 Uhr.",
    },
    {
      number: 3,
      title: "Buchhandlung Steiner",
      text: "Bücher zum halben Preis: Richtig telefonieren – Gesprächstraining für SekretärInnen, Gesund essen im Büro, 100 Jahre Sportfotografie, Diverse Kinderbücher. Angebot gültig bis Ende Mai.",
    },
    {
      number: 4,
      title: "Die ganze Welt um wenig Geld!",
      text: "Günstige Auslandsanrufe ab 1,9 Cent/Minute. weltweitanrufen.de bietet Ihnen die besten Tarife für Anrufe in Mobilnetze und ins ausländische Festnetz. www.weltweitanrufen.de",
    },
    {
      number: 5,
      title: "Hilfe im Haushalt",
      text: "SIE SUCHEN JEMANDEN, der Ihre Wäsche wäscht und bügelt? SIE BRAUCHEN JEMANDEN, der beim Saubermachen oder bei der Gartenarbeit hilft? Kein Problem! RUFEN SIE MICH AN: Petra Maier, Tel. 0676 55 68 987",
    },
    {
      number: 6,
      title: "Feinkost Klement",
      text: "In unserem Delikatessengeschäft bieten wir Ihnen: hausgemachte Salate, Brötchen mit Ei- und Curryaufstrich, Schinken und Käse aus der Region. Petersgasse 8, 4051 Basel. Mo–Sa: 9–18 Uhr.",
    },
  ],
};

export const mockA1JaNeinPerAnzeige: OsdA1JaNeinPerAnzeige = {
  type: "OSD_A1_JA_NEIN_PER_ANZEIGE",
  instructions:
    "Vous lisez trois annonces. Pour chaque annonce, répondez aux deux questions par JA ou NEIN.",
  anzeigen: [
    {
      number: 1,
      title: "Schönes-Wochenende-Ticket",
      text: "Gültig ab Samstag 0 Uhr bis Montag 3 Uhr für Reisen in Deutschland. Für Gruppen bis zu fünf Personen und für Einzelreisende. Preis: 39 Euro im Internet, 41 Euro im Reisezentrum an Ihrem Bahnhof. www.bahn.de/angebote",
      questions: [
        { id: "1a", question: "Kann man am Freitagabend mit dem Ticket fahren?", correctAnswer: "NEIN" },
        { id: "1b", question: "Kostet das Ticket beim Kauf am Bahnhof mehr?", correctAnswer: "JA" },
      ],
    },
    {
      number: 2,
      title: "Lesen im Park",
      text: "Im Sommer gibt es in Grazer Parks wieder Bücherkisten mit vielen Kinderbüchern – zum Lesen vor Ort oder zum Mit-nach-Hause-Nehmen. Weitere Aktivitäten: Bastel- und Malgruppen; Papier und Stifte haben wir für dich. www.lesen-im-park.at",
      questions: [
        { id: "2a", question: "Darf man die Bücher nur im Park lesen?", correctAnswer: "NEIN" },
        { id: "2b", question: "Müssen die Kinder Papier und Stifte mitbringen?", correctAnswer: "NEIN" },
      ],
    },
    {
      number: 3,
      title: "3-Zimmer-Wohnung",
      text: "Neu renovierte Wohnung (63 m²) ab 1. August zu vermieten. Gesamtmiete: CHF 1.200,–. Sie haben noch Fragen? Schreiben Sie eine E-Mail an: info@immobilien-heiss.ch. Termine zur Wohnungsbesichtigung: 15. Juli, 11.00 Uhr | 18. Juli, 15.00 Uhr",
      questions: [
        { id: "3a", question: "Kann man telefonisch Informationen bekommen?", correctAnswer: "NEIN" },
        { id: "3b", question: "Kann man die Wohnung am Vormittag sehen?", correctAnswer: "JA" },
      ],
    },
  ],
};

export const mockA1TextBild: OsdA1TextBild = {
  type: "OSD_A1_TEXT_BILD",
  instructions:
    "Vous lisez 5 textes courts (A–E). Pour chaque texte, choisissez l'image qui correspond (1–6). Attention : il y a une image de trop.",
  texts: [
    {
      letter: "A",
      content:
        "Liebe Besucherinnen und Besucher! Im Krankenhaus ist das Telefonieren mit Handy verboten. Bitte schalten Sie Ihr Handy während Ihres Besuchs bei uns aus.",
      correctBild: 5,
    },
    {
      letter: "B",
      content:
        "Liebe Kolleginnen und Kollegen! In den Büroräumen ist das Rauchen verboten. Bitte nützen Sie die Raucherzonen im Erdgeschoss.",
      correctBild: 4,
    },
    {
      letter: "C",
      content:
        "Der Flughafen-Bus bringt Sie schnell und bequem ins Stadtzentrum. Nützen Sie das Angebot! Fahrplanauskünfte am Flughafen Graz: +43 (316) 2902 172",
      correctBild: 1,
    },
    {
      letter: "D",
      content:
        "Gasthaus Neuwirth — leichte regionale Küche, frische Salate vom Buffet, günstige Mittagsmenüs. Mo–Sa: 9–22 Uhr | Sonntag Ruhetag",
      correctBild: 6,
    },
    {
      letter: "E",
      content:
        "Liebe Hundebesitzer! Wir bitten Sie, im Interesse aller Parkbenützer Ihren Hund an die Leine zu nehmen.",
      correctBild: 3,
    },
  ],
  bilder: [
    { number: 1, description: "Un bus de l'aéroport (Flughafen-Bus) qui roule vers le centre-ville." },
    { number: 2, description: "Une cuisine moderne avec plusieurs salades préparées." },
    { number: 3, description: "Un panneau dans un parc avec un chien tenu en laisse." },
    { number: 4, description: "Un panneau « Rauchen verboten » dans des locaux de bureau." },
    { number: 5, description: "Un téléphone portable barré, dans un couloir d'hôpital." },
    { number: 6, description: "L'entrée d'un restaurant avec une ardoise indiquant un menu du midi." },
  ],
};

export const mockA1HoerenAudioFoto: OsdA1HoerenAudioFoto = {
  type: "OSD_A1_HOEREN_AUDIO_FOTO",
  instructions:
    "Vous entendez cinq textes courts. Quel texte correspond à quelle photo ? Attention : il y a une photo de trop.",
  audioTexts: [
    {
      number: 1,
      script:
        "Ja, ich habe sie gestern in der Stadt getroffen. Sie hat ein neues Kleid gekauft – wirklich sehr schön!",
      correctFoto: "C",
    },
    {
      number: 2,
      script:
        "Die Maschine ist um 14 Uhr 30 in Frankfurt gelandet. Jetzt warten wir auf die Koffer.",
      correctFoto: "E",
    },
    {
      number: 3,
      script:
        "Komm, wir setzen uns hier ans Fenster. Hier ist es ruhig und wir können in Ruhe essen.",
      correctFoto: "D",
    },
    {
      number: 4,
      script:
        "Ich finde, der rote Pullover passt besser zu deiner Hose. Probier ihn doch mal an!",
      correctFoto: "B",
    },
    {
      number: 5,
      script:
        "Schau mal, wie schön die Berge heute aussehen! Und der Schnee glänzt in der Sonne.",
      correctFoto: "A",
    },
  ],
  fotos: [
    { letter: "A", description: "Paysage de montagne enneigée sous un soleil éclatant." },
    { letter: "B", description: "Magasin de vêtements avec pull rouge en évidence." },
    { letter: "C", description: "Deux amies en ville, l'une montrant un sac de boutique." },
    { letter: "D", description: "Table de restaurant près d'une fenêtre, ambiance calme." },
    { letter: "E", description: "Aéroport, voyageurs attendant leurs bagages." },
    { letter: "F", description: "Une plage tropicale avec palmiers (distracteur)." },
  ],
};

export const mockA1HoerenNotizen: OsdA1HoerenNotizen = {
  type: "OSD_A1_HOEREN_NOTIZEN",
  instructions:
    "Vous entendez le message suivant. Écoutez bien et écrivez les informations les plus importantes sur le bloc-notes. Vous entendez le texte deux fois.",
  script:
    "Hallo, hier ist Anna. Du, ich rufe wegen dem Auto an, das wir uns am Dienstag ansehen wollen. Es ist am 12. Mai, am Nachmittag, um 14 Uhr. Wir treffen uns in der Bernergasse 12 — das ist nicht weit vom Bahnhof. Ruf mich bitte noch zurück, meine Nummer ist 0664 / 2582641. Bis bald!",
  notes: [
    {
      id: "was",
      label: "Was:",
      placeholder: "...",
      correctAnswer: "Auto ansehen",
      acceptedVariants: ["Auto ansehen", "Auto anschauen"],
    },
    {
      id: "wann_tag",
      label: "Wann: am",
      placeholder: "Tag",
      correctAnswer: "Dienstag",
      acceptedVariants: ["Dienstag", "Di", "Di."],
    },
    {
      id: "wann_datum",
      label: "Wann: am Nachmittag, Mai",
      placeholder: "Datum",
      correctAnswer: "12",
      acceptedVariants: ["12", "12."],
    },
    {
      id: "wann_uhr",
      label: "Wann: um Uhr",
      placeholder: "Heure",
      correctAnswer: "14",
      acceptedVariants: ["14", "14 Uhr", "2"],
    },
    {
      id: "wo",
      label: "Wo: in der ___gasse 12",
      placeholder: "Nom de rue",
      correctAnswer: "Berner",
      acceptedVariants: ["Berner"],
    },
    {
      id: "telefon",
      label: "Telefonnummer: 0664 /",
      placeholder: "Numéro",
      correctAnswer: "2582641",
      acceptedVariants: ["2582641", "258 26 41", "258-26-41"],
    },
  ],
};

export const mockA1HoerenInterview: OsdA1HoerenInterviewSingleChoice = {
  type: "OSD_A1_HOEREN_INTERVIEW_SINGLE",
  instructions:
    "Vous entendez 5 personnes interrogées. Écoutez bien et cochez la bonne réponse. Pour chaque personne, il n'y a qu'une seule réponse.",
  question: "Wo gefällt es Ihnen am besten?",
  columns: ["Afrika", "Amerika", "Asien", "Europa"],
  speakers: [
    {
      number: 1,
      label: "Sprecher 1",
      script:
        "Also, ich war schon überall – aber am liebsten reise ich nach Thailand und Vietnam. Die Küche, die Menschen, das Klima – einfach wunderbar.",
      correctColumnIndex: 2,
    },
    {
      number: 2,
      label: "Sprecherin 2",
      script:
        "Mir gefällt es in Spanien und Italien am besten. Die Geschichte, die Architektur – das fasziniert mich.",
      correctColumnIndex: 3,
    },
    {
      number: 3,
      label: "Sprecher 3",
      script:
        "Ich war letztes Jahr in Kenia und in Tansania. Die Tiere, die Savanne – ein unglaubliches Erlebnis.",
      correctColumnIndex: 0,
    },
    {
      number: 4,
      label: "Sprecherin 4",
      script:
        "New York, Los Angeles, San Francisco – ich liebe die USA. Die Städte sind so groß und lebendig.",
      correctColumnIndex: 1,
    },
    {
      number: 5,
      label: "Sprecher 5",
      script:
        "Für mich gibt es nichts Schöneres als die Berge in Österreich und der Schweiz. Hier fühle ich mich zuhause.",
      correctColumnIndex: 3,
    },
  ],
};

export const mockA1Formular: OsdA1Formular = {
  type: "OSD_A1_FORMULAR",
  instructions:
    "Vous voulez vous inscrire à un cours d'allemand. Vous devez remplir un formulaire. Vous pouvez inventer les réponses (autre nom, autre date de naissance, etc.).",
  formularTitle: "ANMELDUNG",
  fields: [
    { id: "nachname", label: "Nachname(n)", inputType: "text", placeholder: "Müller", required: true },
    { id: "vorname", label: "Vorname(n)", inputType: "text", placeholder: "Anna", required: true },
    { id: "geburtsdatum", label: "Geburtsdatum", inputType: "date", placeholder: "TT.MM.JJJJ", required: true },
    { id: "geschlecht", label: "Geschlecht", inputType: "radio", options: ["weiblich", "männlich"], required: true },
    { id: "adresse", label: "Adresse (Straße + Nr.)", inputType: "text", placeholder: "Hauptstraße 12", required: true },
    { id: "plz_ort", label: "Postleitzahl + Ort", inputType: "text", placeholder: "1010 Wien", required: true },
  ],
};

export const mockA1EmailAntwort: OsdA1EmailAntwort = {
  type: "OSD_A1_EMAIL_ANTWORT",
  instructions:
    "Votre amie Rafaela habite à Berlin et vous a invité(e). Répondez à son e-mail en environ 30 mots. Répondez à toutes ses questions et écrivez un salut à la fin.",
  scenario: "Vous prévoyez de rendre visite à votre amie Rafaela qui habite à Berlin.",
  receivedEmail: {
    from: "m.rafaela@gmx.net",
    subject: "Deine Reise nach Berlin",
    body: "Hallo!\n\nDu schreibst, du möchtest bald zu mir nach Berlin kommen. Ich freue mich schon sehr! Du kannst auch gerne jemanden von deiner Familie oder Freunde mitbringen.\n\nSchreib mir bitte: An welchem Tag und um wie viel Uhr kommst du? Wie lange möchtest du bleiben? Wen bringst du mit?\n\nLiebe Grüße\nRafaela",
  },
  responsePoints: [
    "An welchem Tag und um wie viel Uhr kommst du?",
    "Wie lange möchtest du bleiben?",
    "Wen bringst du mit?",
  ],
  minWords: 25,
  maxWords: 50,
};

export const ALL_A1_MOCKS = [
  mockA1SituationAnzeige,
  mockA1JaNeinPerAnzeige,
  mockA1TextBild,
  mockA1HoerenAudioFoto,
  mockA1HoerenNotizen,
  mockA1HoerenInterview,
  mockA1Formular,
  mockA1EmailAntwort,
] as const;
