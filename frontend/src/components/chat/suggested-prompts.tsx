"use client";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  "How do I make scrambled eggs?",
  "What can I cook with a frying pan and eggs?",
  "Give me a simple pasta recipe",
  "What's the best way to use a whisk?",
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {SUGGESTIONS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-left p-4 rounded-xl border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-sm text-zinc-700"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
