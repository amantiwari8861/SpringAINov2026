"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bot, MessageCircleMore, SendHorizontal, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const CHAT_STREAM_API_URL = "http://localhost:9090/api/v1/openai/stream";
const REQUEST_TIMEOUT_MS = 15000;

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    text: "Hey, welcome. Need help choosing a plan?",
  },
];

export default function FloatingChatbotSSE() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState("");

  const messageListEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const nextId = useMemo(() => {
    const maxId = messages.reduce((max, msg) => Math.max(max, msg.id), 0);
    return maxId + 1;
  }, [messages]);

  useEffect(() => {
    if (!open) {
      return;
    }
    messageListEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping, open]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  function getReadableErrorMessage(error, status) {
    if (typeof status === "number") {
      if (status >= 500) {
        return "Server error from chat API. Please try again in a moment.";
      }

      if (status >= 400) {
        return "Request was rejected by chat API. Please check your input and try again.";
      }
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return "Request timed out. Please try again.";
    }

    return "Could not reach chat API. Make sure Spring Boot is running on port 9090 and CORS is enabled.";
  }

  async function requestReplyStream(text, onChunk) {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CHAT_STREAM_API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw { status: response.status };
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (!response.body) {
        throw new Error("Streaming response body is not available");
      }

      if (!contentType.includes("text/event-stream")) {
        const fallbackText = (await response.text()).trim();

        if (!fallbackText) {
          throw new Error("Empty response from chat API");
        }

        onChunk(fallbackText);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let hasReceivedChunk = false;

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";

        for (const event of events) {
          const lines = event.split(/\r?\n/);

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const data = line.slice(5);

            if (!data || data === "[DONE]") {
              continue;
            }

            hasReceivedChunk = true;
            onChunk(data);
          }
        }
      }

      const pending = buffer;
      if (pending) {
        const normalizedPending = pending.startsWith("data:")
          ? pending.slice(5)
          : pending;

        if (normalizedPending && normalizedPending !== "[DONE]") {
          hasReceivedChunk = true;
          onChunk(normalizedPending);
        }
      }

      if (!hasReceivedChunk) {
        throw new Error("No content received from stream");
      }
    } finally {
      clearTimeout(timeoutId);

      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }

  async function handleSend(overrideMessage) {
    const text = (overrideMessage ?? input).trim();
    if (!text || isTyping) {
      return;
    }

    const assistantMessageId = Date.now();

    if (!overrideMessage) {
      setMessages((prev) => [
        ...prev,
        { id: nextId, role: "user", text },
        { id: assistantMessageId, role: "assistant", text: "" },
      ]);
      setInput("");
    } else {
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", text: "" },
      ]);
    }

    setErrorMessage(null);
    setLastUserMessage(text);
    setIsTyping(true);

    try {
      await requestReplyStream(text, (chunk) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId
              ? { ...message, text: `${message.text}${chunk}` }
              : message,
          ),
        );
      });
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number(error.status)
          : undefined;
      const readableError = getReadableErrorMessage(error, status);

      setErrorMessage(readableError);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? { ...message, text: "I could not fetch a reply right now." }
            : message,
        ),
      );
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.section
            key="chat-panel"
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.92 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="mb-4 flex h-[58vh] w-[92vw] max-w-95 flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 shadow-2xl shadow-blue-900/30 backdrop-blur-xl sm:h-115"
          >
            <header className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-blue-600 text-slate-950">
                <Bot className="h-5 w-5" />
              </div>

              <div className="mr-auto">
                <p className="text-sm font-semibold text-white">AI Assistant</p>
                <p className="text-xs text-slate-400">
                  Usually replies in a few seconds
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {messages.map((message) => {
                const isBot = message.role === "assistant";

                if (isBot && !message.text) {
                  return null;
                }

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    {isBot ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                        <Bot className="h-4 w-4" />
                      </div>
                    ) : null}

                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isBot
                          ? "rounded-bl-sm border border-white/10 bg-white/10 text-slate-100"
                          : "rounded-br-sm bg-linear-to-r from-blue-600 to-cyan-500 text-white"
                      }`}
                    >
                      {message.text}
                    </div>

                    {!isBot ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-400/20 text-blue-200">
                        <User className="h-4 w-4" />
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}

              {isTyping && messages[messages.length - 1]?.text === "" ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-cyan-200"
                          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.12,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {errorMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-xs text-red-100"
                >
                  <p>{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => handleSend(lastUserMessage)}
                    className="mt-2 rounded-md border border-red-200/40 px-2 py-1 text-[11px] font-medium text-red-100 transition hover:bg-red-400/20"
                    disabled={isTyping || !lastUserMessage}
                  >
                    Retry
                  </button>
                </motion.div>
              ) : null}

              <div ref={messageListEndRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="border-t border-white/10 p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!input.trim() || isTyping}
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.section>
        ) : (
          <motion.button
            key="chat-trigger"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileTap={{ scale: 0.95 }}
            className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-900/40"
            aria-label="Open chatbot"
          >
            <MessageCircleMore className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
