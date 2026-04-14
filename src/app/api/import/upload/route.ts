import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { documentImport, userProfile } from "@/lib/db/schema";
import { inngest } from "@/lib/inngest/client";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const uid = session.user.id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Fichier trop grand (max 10MB)" }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "Seuls les PDF sont acceptés" }, { status: 400 });

  // Extraire le texte du PDF avec unpdf (compatible Next.js, pas de dépendances natives)
  const buffer = Buffer.from(await file.arrayBuffer());
  const { extractText } = await import("unpdf");
  const { text: extractedText } = await extractText(new Uint8Array(buffer), { mergePages: true });

  if (!extractedText || extractedText.trim().length < 50) {
    return NextResponse.json({ error: "Impossible d'extraire le texte du PDF" }, { status: 400 });
  }

  // Récupérer le profil pour level/sector
  const profile = await db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) });

  // Créer l'entrée en DB
  const [doc] = await db.insert(documentImport).values({
    id: nanoid(),
    userId: uid,
    fileName: file.name,
    fileSize: file.size,
    docType: "unknown",
    status: "pending",
    extractedText,
  }).returning();

  // Déclencher le job Inngest
  await inngest.send({
    name: "document/process",
    data: {
      importId: doc.id,
      userId: uid,
      extractedText,
      level: profile?.level ?? "A1",
      sector: profile?.sector ?? "QUOTIDIEN",
    },
  });

  return NextResponse.json({ importId: doc.id, status: "pending" });
}
