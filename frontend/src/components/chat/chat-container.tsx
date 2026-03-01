"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestedPrompts } from "./suggested-prompts";
import { ChefHat, ArrowDown, AlertTriangle } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

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

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
  }, []);

  const showTypingIndicator =
    isLoading && messages[messages.length - 1]?.content === "";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-dvh bg-cream-50">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-md bg-cream-50/90 border-b border-cream-200/60">
          <div className="flex items-center gap-2.5 px-4 py-3 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-bark-800 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-cream-50" />
            </div>
            <h1 className="text-sm font-semibold text-bark-800">Chef AI</h1>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)]">
                <SuggestedPrompts onSelect={sendMessage} />
              </div>
            ) : (
              messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
            )}

            {showTypingIndicator && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-bark-800 flex items-center justify-center shrink-0">
                    <ChefHat className="w-3.5 h-3.5 text-cream-50" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-cream-200/80 shadow-sm">
                    <div className="flex gap-1.5 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-bark-600/40 rounded-full animate-pulse-dot" />
                      <span className="w-1.5 h-1.5 bg-bark-600/40 rounded-full animate-pulse-dot [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-bark-600/40 rounded-full animate-pulse-dot [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200/50 text-red-700 animate-fade-in-up">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Scroll to bottom FAB */}
        {!isAtBottom && messages.length > 0 && (
          <div className="relative max-w-3xl mx-auto w-full">
            <button
              onClick={scrollToBottom}
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-cream-200 shadow-md flex items-center justify-center hover:bg-cream-100 transition-colors cursor-pointer"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-3.5 h-3.5 text-bark-600" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-cream-200/60">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
