"use client";

import { ChefHat, Flame, Egg, CookingPot, Utensils } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Flame,
    label: "Quick dinner",
    description: "A 30-minute weeknight recipe",
    prompt: "Give me a quick weeknight dinner recipe I can make in 30 minutes",
  },
  {
    icon: Egg,
    label: "Scrambled eggs",
    description: "The perfect technique",
    prompt: "How do I make perfect scrambled eggs?",
  },
  {
    icon: CookingPot,
    label: "One-pot pasta",
    description: "Simple & minimal cleanup",
    prompt: "Give me a simple one-pot pasta recipe",
  },
  {
    icon: Utensils,
    label: "Kitchen tips",
    description: "Tools & techniques",
    prompt: "What's the best way to use a whisk?",
  },
];

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <ChefHat className="w-9 h-9 text-cream-50" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-bark-800 tracking-tight">
            What&apos;s cooking today?
          </h2>
          <p className="text-bark-600 text-sm mt-2 max-w-sm leading-relaxed">
            Recipes, techniques, substitutions, and kitchen tips — ask me anything.
          </p>
        </div>
      </div>

      {/* Prompt cards */}
      <div className="grid grid-cols-2 gap-3 max-w-md w-full">
        {SUGGESTIONS.map(({ icon: Icon, label, description, prompt }) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="group flex flex-col items-start gap-2 text-left p-4 rounded-2xl border border-cream-200 bg-white/60 hover:bg-white hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-100 group-hover:bg-orange-600 flex items-center justify-center shrink-0 transition-colors duration-200">
              <Icon className="w-5 h-5 text-orange-600 group-hover:text-cream-50 transition-colors duration-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-bark-800 leading-snug">
                {label}
              </p>
              <p className="text-xs text-bark-600/70 mt-0.5 leading-snug">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
