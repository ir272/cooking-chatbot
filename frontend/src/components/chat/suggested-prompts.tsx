"use client";

import { ChefHat, Flame, Egg, CookingPot, Utensils } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Flame,
    label: "Quick weeknight dinner",
    prompt: "Give me a quick weeknight dinner recipe I can make in 30 minutes",
  },
  {
    icon: Egg,
    label: "Perfect scrambled eggs",
    prompt: "How do I make perfect scrambled eggs?",
  },
  {
    icon: CookingPot,
    label: "One-pot pasta",
    prompt: "Give me a simple one-pot pasta recipe",
  },
  {
    icon: Utensils,
    label: "Kitchen tool tips",
    prompt: "What's the best way to use a whisk?",
  },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center shadow-lg">
          <ChefHat className="w-8 h-8 text-cream-50" />
        </div>
        <h2 className="text-2xl font-bold text-bark-800">
          What&apos;s cooking today?
        </h2>
        <p className="text-bark-600 text-sm max-w-md">
          I can help with recipes, cooking techniques, ingredient substitutions,
          and kitchen tool tips.
        </p>
      </div>

      {/* Prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="group flex items-start gap-3 text-left p-4 rounded-xl border border-cream-200 bg-cream-100/50 hover:border-orange-500 hover:bg-cream-100 transition-all duration-200 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-cream-200 group-hover:bg-orange-600 flex items-center justify-center shrink-0 transition-colors duration-200">
              <Icon className="w-4.5 h-4.5 text-bark-600 group-hover:text-cream-50 transition-colors duration-200" />
            </div>
            <span className="text-sm text-bark-600 group-hover:text-bark-800 leading-snug pt-1.5 transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
