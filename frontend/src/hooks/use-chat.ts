"use client";

import { useCallback, useRef, useState } from "react";
import { Message } from "@/types/chat";
import { streamChat } from "@/lib/api";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadIdRef = useRef(crypto.randomUUID());
  const isLoadingRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoadingRef.current) return;

      isLoadingRef.current = true;
      setError(null);
      setIsLoading(true);

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
        () => {
          isLoadingRef.current = false;
          setIsLoading(false);
        },
        (err) => {
          setError(err);
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      );
    },
    []
  );

  return { messages, isLoading, error, sendMessage };
}
