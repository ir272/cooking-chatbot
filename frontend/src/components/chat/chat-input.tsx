"use client";

import { useState, KeyboardEvent } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 2000;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-cream-50 safe-bottom">
      <div className="flex items-end gap-2 p-3 px-4 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <TextareaAutosize
            value={input}
            onChange={(e) =>
              setInput(e.target.value.slice(0, MAX_LENGTH))
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about cooking..."
            disabled={disabled}
            minRows={1}
            maxRows={5}
            className="w-full resize-none rounded-2xl border border-cream-200 bg-white px-4 py-3 pr-12 text-sm text-bark-800 placeholder:text-bark-600/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 disabled:opacity-50 transition-all shadow-sm"
          />
          {input.length > 0 && (
            <span className="absolute bottom-2 right-14 text-[10px] text-bark-600/40 tabular-nums">
              {input.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          aria-label="Send message"
          className="w-10 h-10 shrink-0 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-cream-200 disabled:text-bark-600/30 text-cream-50 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed mb-0.5"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
