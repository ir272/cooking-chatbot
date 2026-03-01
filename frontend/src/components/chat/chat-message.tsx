"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChefHat, Copy, Check, Clock, Users } from "lucide-react";
import { Message } from "@/types/chat";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: Message;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [text]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="p-1 rounded-md hover:bg-cream-200/80 text-bark-600/40 hover:text-bark-600 transition-colors cursor-pointer"
          aria-label={copied ? "Copied!" : "Copy message"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-sage-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{copied ? "Copied!" : "Copy"}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function RecipeMeta({ content }: { content: string }) {
  const lines = content.split("\n");
  let prepTime = "";
  let servings = "";

  for (const line of lines) {
    if (line.toLowerCase().includes("prep time") || line.toLowerCase().includes("time:")) {
      prepTime = line.split(":").pop()?.trim() || "";
    }
    if (line.toLowerCase().includes("servings") || line.toLowerCase().includes("serves")) {
      servings = line.split(":").pop()?.replace(/\d+\s*(-)?\s*\d*/, "").trim() || "";
      const match = line.match(/\d+/);
      if (match) servings = match[0];
    }
  }

  if (!prepTime && !servings) return null;

  return (
    <div className="flex gap-4 text-xs text-bark-600/70 mb-3 pb-3 border-b border-bark-800/5">
      {prepTime && (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{prepTime}</span>
        </div>
      )}
      {servings && (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{servings} servings</span>
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Don't render empty assistant messages — the typing indicator handles this state
  if (!isUser && !message.content) {
    return null;
  }

  const isRecipe = !isUser && (
    message.content.toLowerCase().includes("ingredients") ||
    message.content.toLowerCase().includes("instructions") ||
    message.content.toLowerCase().includes("steps")
  );

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-tr-md px-4 py-2.5 bg-orange-600 text-cream-50">
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
      <div className="flex items-start gap-2.5 max-w-[85%]">
        <div className="w-7 h-7 rounded-full bg-bark-800 flex items-center justify-center shrink-0 mt-0.5">
          <ChefHat className="w-3.5 h-3.5 text-cream-50" />
        </div>
        <div className="min-w-0">
          <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-cream-200/80 shadow-sm">
            {isRecipe && <RecipeMeta content={message.content} />}
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-base font-semibold text-bark-800 mt-3 mb-1.5 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold text-bark-800 mt-3 mb-1 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-bark-800 mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-1.5 space-y-0.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-1.5 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-bark-800 leading-relaxed">
                      {children}
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-bark-800 leading-relaxed mb-2 last:mb-0">
                      {children}
                    </p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          {message.content && (
            <div className="flex mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={message.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
