"use client";

/**
 * GermanKeyboard — mini clavier flottant pour les caractères spéciaux allemands.
 *
 * Usage avec textarea/input via ref :
 *   <GermanKeyboard inputRef={ref} onInsert={(char) => setText(prev => prev + char)} />
 *
 * Le composant insère le caractère à la position du curseur (selectionStart),
 * pas en fin de chaîne, et replace la sélection si du texte est sélectionné.
 */

import { motion } from "framer-motion";

const CHARS = [
  { char: "ä", label: "ä" },
  { char: "ö", label: "ö" },
  { char: "ü", label: "ü" },
  { char: "ß", label: "ß" },
  { char: "Ä", label: "Ä" },
  { char: "Ö", label: "Ö" },
  { char: "Ü", label: "Ü" },
];

interface Props {
  /** Ref vers le <textarea> ou <input> cible */
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  /** Callback appelé avec la nouvelle valeur complète après insertion */
  onInsert: (newValue: string) => void;
  /** Valeur actuelle du champ (nécessaire pour calculer l'insertion) */
  value: string;
  disabled?: boolean;
}

export function GermanKeyboard({ inputRef, onInsert, value, disabled }: Props) {
  const handleChar = (char: string) => {
    if (disabled) return;

    const el = inputRef.current;
    if (!el) {
      // Fallback : append en fin de chaîne
      onInsert(value + char);
      return;
    }

    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;

    const newValue = value.slice(0, start) + char + value.slice(end);
    onInsert(newValue);

    // Replacer le curseur après le caractère inséré
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1 flex-wrap"
    >
      <span className="text-[10px] text-gray-300 font-medium mr-0.5 select-none">DE</span>
      {CHARS.map(({ char, label }) => (
        <button
          key={char}
          type="button"
          disabled={disabled}
          onMouseDown={(e) => {
            // Empêcher le blur du textarea avant d'avoir lu selectionStart
            e.preventDefault();
            handleChar(char);
          }}
          className="h-7 min-w-7 px-1.5 rounded-md border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed select-none"
        >
          {label}
        </button>
      ))}
    </motion.div>
  );
}
