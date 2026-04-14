export const BADGE_DEFINITIONS = [
  // STREAK
  { id: "streak_3",      nameFr: "3 jours de suite",      descFr: "Complète 3 jours consécutifs",       category: "STREAK",    condition: { type: "streak",   value: 3  }, xpBonus: 20,  icon: "Flame"    },
  { id: "streak_7",      nameFr: "Une semaine",            descFr: "Complète 7 jours consécutifs",       category: "STREAK",    condition: { type: "streak",   value: 7  }, xpBonus: 50,  icon: "Flame"    },
  { id: "streak_30",     nameFr: "Un mois",                descFr: "Complète 30 jours consécutifs",      category: "STREAK",    condition: { type: "streak",   value: 30 }, xpBonus: 200, icon: "Flame"    },
  // XP
  { id: "xp_100",        nameFr: "Premier pas",            descFr: "Gagne 100 XP",                       category: "XP",        condition: { type: "xp",       value: 100  }, xpBonus: 10,  icon: "Zap"    },
  { id: "xp_500",        nameFr: "En route",               descFr: "Gagne 500 XP",                       category: "XP",        condition: { type: "xp",       value: 500  }, xpBonus: 30,  icon: "Zap"    },
  { id: "xp_1000",       nameFr: "Mille points",           descFr: "Gagne 1 000 XP",                     category: "XP",        condition: { type: "xp",       value: 1000 }, xpBonus: 50,  icon: "Zap"    },
  { id: "xp_5000",       nameFr: "Expert",                 descFr: "Gagne 5 000 XP",                     category: "XP",        condition: { type: "xp",       value: 5000 }, xpBonus: 150, icon: "Trophy" },
  // MILESTONE
  { id: "first_session", nameFr: "Première session",       descFr: "Complète ta première session",       category: "MILESTONE", condition: { type: "sessions", value: 1  }, xpBonus: 15,  icon: "BookOpen" },
  { id: "sessions_10",   nameFr: "Assidu",                 descFr: "Complète 10 sessions",               category: "MILESTONE", condition: { type: "sessions", value: 10 }, xpBonus: 60,  icon: "BookOpen" },
  { id: "sessions_50",   nameFr: "Dévoué",                 descFr: "Complète 50 sessions",               category: "MILESTONE", condition: { type: "sessions", value: 50 }, xpBonus: 200, icon: "Trophy"   },
  // SKILL
  { id: "vocab_10",      nameFr: "Vocabulaire débutant",   descFr: "Apprends 10 mots de vocabulaire",    category: "SKILL",     condition: { type: "vocab",    value: 10 }, xpBonus: 25,  icon: "BookOpen" },
  { id: "vocab_50",      nameFr: "Vocabulaire avancé",     descFr: "Apprends 50 mots de vocabulaire",    category: "SKILL",     condition: { type: "vocab",    value: 50 }, xpBonus: 75,  icon: "BookOpen" },
  { id: "speak_1",       nameFr: "Première conversation",  descFr: "Complète une conversation IA",       category: "SKILL",     condition: { type: "speak",    value: 1  }, xpBonus: 30,  icon: "Mic"      },
] as const;
