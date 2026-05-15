import type {
  OsdA1HoerenNotizen,
  OsdA1EmailAntwort,
  OsdRendererProps,
} from "./osd-a1.types";

export type { OsdRendererProps };

export interface OsdA2HeadlineTextMatching {
  type: "OSD_A2_HEADLINE_TEXT_MATCHING";
  instructions: string;
  headlines: Array<{
    letter: string;
    text: string;
  }>;
  texts: Array<{
    number: number;
    content: string;
    source?: string;
    correctHeadline: string;
  }>;
}

export interface OsdA2LongTextMC {
  type: "OSD_A2_LONG_TEXT_MC";
  instructions: string;
  text: string;
  textTitle?: string;
  textSource?: string;
  beispiel?: {
    question: string;
    options: Array<{ id: string; text: string }>;
    correctId: string;
  };
  questions: Array<{
    number: number;
    question: string;
    options: Array<{ id: string; text: string }>;
    correctId: string;
  }>;
}

export interface OsdA2WetterMultiSelect {
  type: "OSD_A2_WETTER_MULTI_SELECT";
  instructions: string;
  topic: string;
  script: string;
  options: string[];
  correctOptions: string[];
  expectedSelectionCount: number;
}

export interface OsdA2HoerenInterviewMulti {
  type: "OSD_A2_HOEREN_INTERVIEW_MULTI";
  instructions: string;
  question: string;
  columns: string[];
  speakers: Array<{
    number: number;
    label: string;
    script: string;
    correctColumnIndices: number[];
  }>;
}

export interface OsdA2HoerenNotizen extends Omit<OsdA1HoerenNotizen, "type"> {
  type: "OSD_A2_HOEREN_NOTIZEN";
}

export interface OsdA2EmailAntwort extends Omit<OsdA1EmailAntwort, "type"> {
  type: "OSD_A2_EMAIL_ANTWORT";
}

export type OsdA2Exercise =
  | OsdA2HeadlineTextMatching
  | OsdA2LongTextMC
  | OsdA2WetterMultiSelect
  | OsdA2HoerenInterviewMulti
  | OsdA2HoerenNotizen
  | OsdA2EmailAntwort;

export type OsdA2ExerciseType = OsdA2Exercise["type"];

export const OSD_A2_TYPE_LABELS: Record<OsdA2ExerciseType, string> = {
  OSD_A2_HEADLINE_TEXT_MATCHING: "Lesen Aufg. 1 — Überschriften ↔ Texte",
  OSD_A2_LONG_TEXT_MC: "Lesen Aufg. 2 — Texte + QCM (avec Beispiel)",
  OSD_A2_WETTER_MULTI_SELECT: "Hören Aufg. 1 — Multi-select (Wetter)",
  OSD_A2_HOEREN_NOTIZEN: "Hören Aufg. 2 — Notizen",
  OSD_A2_HOEREN_INTERVIEW_MULTI: "Hören Aufg. 3 — Interview multi-select",
  OSD_A2_EMAIL_ANTWORT: "Schreiben — E-Mail (~50 mots)",
};
