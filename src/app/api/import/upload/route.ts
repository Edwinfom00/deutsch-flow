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

  // Convertir en base64 — Claude lit le PDF directement, plus efficace que l'extraction texte
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const profile = await db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) });

  const [doc] = await db.insert(documentImport).values({
    id: nanoid(),
    userId: uid,
    fileName: file.name,
    fileSize: file.size,
    docType: "unknown",
    status: "pending",
    // On stocke le base64 temporairement pour Inngest
    extractedText: `BASE64:${base64}`,
  }).returning();

  await inngest.send({
    name: "document/process",
    data: {
      importId: doc.id,
      userId: uid,
      pdfBase64: base64,
      level: profile?.level ?? "A1",
      sector: profile?.sector ?? "QUOTIDIEN",
    },
  });

  return NextResponse.json({ importId: doc.id, status: "pending" });
}
