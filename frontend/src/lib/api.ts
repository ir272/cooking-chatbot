export async function streamChat(
  message: string,
  threadId: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, thread_id: threadId }),
    });

    if (!response.ok) {
      onError(`HTTP ${response.status}`);
      return;
    }

    if (!response.body) {
      onError("Response body is empty");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split(/\r?\n/);

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                onToken(parsed.token);
              }
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }
      onDone();
    } finally {
      reader.cancel();
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}
