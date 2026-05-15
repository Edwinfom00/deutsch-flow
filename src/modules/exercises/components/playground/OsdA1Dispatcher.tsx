"use client";

import {
  JaNeinPerAnzeigeRenderer,
  FormularRenderer,
  HoerenInterviewSingleRenderer,
  HoerenNotizenRenderer,
  SituationAnzeigeA1Renderer,
  TextBildRenderer,
  HoerenAudioFotoRenderer,
  EmailAntwortRenderer,
} from "../renderers/osd-a1";
import type { OsdA1Exercise } from "../../types/osd-a1.types";

interface Props {
  exercise: OsdA1Exercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function OsdA1Dispatcher({ exercise, onAnswer, answered }: Props) {
  switch (exercise.type) {
    case "OSD_A1_SITUATION_ANZEIGE":
      return <SituationAnzeigeA1Renderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_JA_NEIN_PER_ANZEIGE":
      return <JaNeinPerAnzeigeRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_TEXT_BILD":
      return <TextBildRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_HOEREN_AUDIO_FOTO":
      return <HoerenAudioFotoRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_HOEREN_NOTIZEN":
      return <HoerenNotizenRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_HOEREN_INTERVIEW_SINGLE":
      return <HoerenInterviewSingleRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_FORMULAR":
      return <FormularRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A1_EMAIL_ANTWORT":
      return <EmailAntwortRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
  }
}
