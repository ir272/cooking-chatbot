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
    <div className="border-t border-cream-200 bg-cream-50 safe-bottom">
      <div className="flex items-end gap-3 p-4 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <TextareaAutosize
            value={input}
            onChange={(e) =>
              setInput(e.target.value.slice(0, MAX_LENGTH))
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask me about cooking, recipes, or kitchen tips..."
            disabled={disabled}
            minRows={1}
            maxRows={5}
            className="w-full resize-none rounded-xl border border-cream-200 bg-white px-4 py-3 text-sm text-bark-800 placeholder:text-bark-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 transition-shadow"
          />
          {input.length > 0 && (
            <span className="absolute bottom-1.5 right-3 text-[10px] text-bark-600/50">
              {input.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          size="icon"
          aria-label="Send message"
          className="w-11 h-11 shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </Button>
      </div>
    </div>
  );
}
