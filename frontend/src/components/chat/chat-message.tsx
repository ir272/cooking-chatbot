"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChefHat, User, Copy, Check } from "lucide-react";
import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-cream-200 text-bark-600"
      aria-label="Copy message"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-sage-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="flex items-start gap-2.5 max-w-[80%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-bark-800 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-cream-50" />
          </div>
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 bg-bark-800 text-cream-50">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in-up group">
      <div className="flex items-start gap-2.5 max-w-[80%]">
        <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
          <ChefHat className="w-4 h-4 text-cream-50" />
        </div>
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-cream-100 text-bark-800 border border-cream-200">
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {message.content && (
            <div className="flex justify-end mt-1 -mb-1 -mr-1">
              <CopyButton text={message.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
