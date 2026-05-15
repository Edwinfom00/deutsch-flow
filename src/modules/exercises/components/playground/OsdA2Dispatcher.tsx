"use client";

import {
  HeadlineTextMatchingA2Renderer,
  LongTextMCRenderer,
  WetterMultiSelectRenderer,
  HoerenInterviewMultiRenderer,
} from "../renderers/osd-a2";
import {
  HoerenNotizenRenderer,
  EmailAntwortRenderer,
} from "../renderers/osd-a1";
import type { OsdA2Exercise } from "../../types/osd-a2.types";
import type { OsdA1HoerenNotizen, OsdA1EmailAntwort } from "../../types/osd-a1.types";

interface Props {
  exercise: OsdA2Exercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function OsdA2Dispatcher({ exercise, onAnswer, answered }: Props) {
  switch (exercise.type) {
    case "OSD_A2_HEADLINE_TEXT_MATCHING":
      return <HeadlineTextMatchingA2Renderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A2_LONG_TEXT_MC":
      return <LongTextMCRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A2_WETTER_MULTI_SELECT":
      return <WetterMultiSelectRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A2_HOEREN_INTERVIEW_MULTI":
      return <HoerenInterviewMultiRenderer exercise={exercise} onAnswer={onAnswer} answered={answered} />;
    case "OSD_A2_HOEREN_NOTIZEN": {
      const adapted: OsdA1HoerenNotizen = { ...exercise, type: "OSD_A1_HOEREN_NOTIZEN" };
      return <HoerenNotizenRenderer exercise={adapted} onAnswer={onAnswer} answered={answered} />;
    }
    case "OSD_A2_EMAIL_ANTWORT": {
      const adapted: OsdA1EmailAntwort = { ...exercise, type: "OSD_A1_EMAIL_ANTWORT" };
      return <EmailAntwortRenderer exercise={adapted} onAnswer={onAnswer} answered={answered} />;
    }
  }
}
