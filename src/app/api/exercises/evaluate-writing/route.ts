import { NextRequest, NextResponse } from "next/server";
import { evaluateWritingResponse } from "@/lib/ai/exercise-generator";
import type { WritingExercise, CEFRLevel } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exerciseContent, userResponse, level } = body as {
      exerciseContent: WritingExercise;
      userResponse: string;
      level: CEFRLevel;
    };

    if (!exerciseContent || !userResponse || !level) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const evaluation = await evaluateWritingResponse(
      exerciseContent,
      userResponse,
      level
    );

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Erreur évaluation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'évaluation" },
      { status: 500 }
    );
  }
}
