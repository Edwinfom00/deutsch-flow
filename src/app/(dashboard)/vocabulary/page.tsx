import { Suspense } from "react";
import { VocabularyPage } from "@/modules/exercises/components/VocabularyPage";
import { getVocabulary } from "@/modules/exercises/server/vocabulary.actions";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function VocabContent() {
  const session = await requireAuth();
  const [words, profile] = await Promise.all([
    getVocabulary(),
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, session.user.id) }),
  ]);
  return (
    <VocabularyPage
      words={words}
      level={profile?.level ?? "A0"}
      sector={profile?.sector ?? "QUOTIDIEN"}
    />
  );
}

function VocabSkeleton() {
  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded-sm" />
          <div className="h-3 w-40 bg-gray-100 rounded-sm" />
        </div>
        <div className="h-9 w-36 bg-gray-200 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => <div key={i} className="h-20 bg-white border border-gray-100 rounded-md" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({length: 8}).map((_, i) => <div key={i} className="h-28 bg-white border border-gray-100 rounded-md" />)}
      </div>
    </div>
  );
}

export default function VocabularyRoute() {
  return (
    <Suspense fallback={<VocabSkeleton />}>
      <VocabContent />
    </Suspense>
  );
}
