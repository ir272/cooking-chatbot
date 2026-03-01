"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestedPrompts } from "./suggested-prompts";
import { ChefHat, AlertCircle, ArrowDown } from "lucide-react";

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
  };

  const showTypingIndicator =
    isLoading && messages[messages.length - 1]?.content === "";

  return (
    <div className="flex flex-col h-dvh max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-cream-50/90 border-b border-cream-200">
        <div className="flex items-center gap-3 p-4">
          <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-cream-50" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-bark-800">Chef AI</h1>
            <p className="text-xs text-bark-600">
              Your personal cooking assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <SuggestedPrompts onSelect={sendMessage} />
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {showTypingIndicator && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                <ChefHat className="w-4 h-4 text-cream-50" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-cream-100 border border-cream-200">
                <div className="flex gap-1.5 items-center h-5">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-dot" />
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-dot [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-dot [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scroll to bottom FAB */}
      {!isAtBottom && messages.length > 0 && (
        <div className="relative">
          <button
            onClick={scrollToBottom}
            className="absolute -top-12 right-4 w-9 h-9 rounded-full bg-cream-100 border border-cream-200 shadow-md flex items-center justify-center hover:bg-cream-200 transition-colors cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4 text-bark-600" />
          </button>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
