export interface OsdRendererProps<T> {
  exercise: T;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export interface OsdA1SituationAnzeige {
  type: "OSD_A1_SITUATION_ANZEIGE";
  instructions: string;
  situations: Array<{
    letter: string;
    text: string;
    correctAnzeige: number;
  }>;
  anzeigen: Array<{
    number: number;
    title?: string;
    text: string;
  }>;
}

export interface OsdA1JaNeinPerAnzeige {
  type: "OSD_A1_JA_NEIN_PER_ANZEIGE";
  instructions: string;
  anzeigen: Array<{
    number: number;
    title?: string;
    text: string;
    questions: Array<{
      id: string;
      question: string;
      correctAnswer: "JA" | "NEIN";
    }>;
  }>;
}

export interface OsdA1TextBild {
  type: "OSD_A1_TEXT_BILD";
  instructions: string;
  texts: Array<{
    letter: string;
    content: string;
    correctBild: number;
  }>;
  bilder: Array<{
    number: number;
    description: string;
    imageUrl?: string;
  }>;
}

export interface OsdA1HoerenAudioFoto {
  type: "OSD_A1_HOEREN_AUDIO_FOTO";
  instructions: string;
  audioTexts: Array<{
    number: number;
    script: string;
    correctFoto: string;
  }>;
  fotos: Array<{
    letter: string;
    description: string;
    imageUrl?: string;
  }>;
}

export interface OsdA1HoerenNotizen {
  type: "OSD_A1_HOEREN_NOTIZEN";
  instructions: string;
  script: string;
  notes: Array<{
    id: string;
    label: string;
    placeholder?: string;
    correctAnswer: string;
    acceptedVariants?: string[];
  }>;
}

export interface OsdA1HoerenInterviewSingleChoice {
  type: "OSD_A1_HOEREN_INTERVIEW_SINGLE";
  instructions: string;
  question: string;
  columns: string[];
  speakers: Array<{
    number: number;
    label: string;
    script: string;
    correctColumnIndex: number;
  }>;
}

export interface OsdA1Formular {
  type: "OSD_A1_FORMULAR";
  instructions: string;
  formularTitle: string;
  fields: Array<{
    id: string;
    label: string;
    inputType: "text" | "date" | "select" | "radio";
    placeholder?: string;
    options?: string[];
    required: boolean;
  }>;
}

export interface OsdA1EmailAntwort {
  type: "OSD_A1_EMAIL_ANTWORT";
  instructions: string;
  scenario: string;
  receivedEmail: {
    from: string;
    subject: string;
    body: string;
  };
  responsePoints: string[];
  minWords: number;
  maxWords: number;
}

export type OsdA1Exercise =
  | OsdA1SituationAnzeige
  | OsdA1JaNeinPerAnzeige
  | OsdA1TextBild
  | OsdA1HoerenAudioFoto
  | OsdA1HoerenNotizen
  | OsdA1HoerenInterviewSingleChoice
  | OsdA1Formular
  | OsdA1EmailAntwort;

export type OsdA1ExerciseType = OsdA1Exercise["type"];

export const OSD_A1_TYPE_LABELS: Record<OsdA1ExerciseType, string> = {
  OSD_A1_SITUATION_ANZEIGE: "Lesen Aufg. 1 — Situation ↔ Anzeige",
  OSD_A1_JA_NEIN_PER_ANZEIGE: "Lesen Aufg. 2 — Ja/Nein per Anzeige",
  OSD_A1_TEXT_BILD: "Lesen Aufg. 3 — Text ↔ Bild",
  OSD_A1_HOEREN_AUDIO_FOTO: "Hören Aufg. 1 — Audio ↔ Foto",
  OSD_A1_HOEREN_NOTIZEN: "Hören Aufg. 2 — Notizen",
  OSD_A1_HOEREN_INTERVIEW_SINGLE: "Hören Aufg. 3 — Interview (1 choix)",
  OSD_A1_FORMULAR: "Schreiben Aufg. 1 — Formular",
  OSD_A1_EMAIL_ANTWORT: "Schreiben Aufg. 2 — E-Mail",
};
