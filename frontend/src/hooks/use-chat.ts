"use client";

import { useCallback, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { streamChat } from "@/lib/api";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadIdRef = useRef(crypto.randomUUID());

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      };

      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      setIsLoading(true);

      await streamChat(
        content.trim(),
        threadIdRef.current,
        (token) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        () => setIsLoading(false),
        (err) => {
          setError(err);
          setIsLoading(false);
        }
      );
    },
    [isLoading]
  );

  return { messages, isLoading, error, sendMessage };
}
