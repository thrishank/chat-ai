"use client";

import { type CoreMessage } from "ai";
import { useEffect, useState } from "react";
import { continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { useRouter } from "next/navigation";
import axios from "axios";
import Markdown from "react-markdown";
import History from "@/components/history";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ExtendedMessage = CoreMessage & {
  id?: number;
  feedback?: boolean;
};

export default function Chat() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");

  const router = useRouter();

  useEffect(() => {
    axios.get("/api/session").then((res) => {
      setSessionId(res.data.id);
    });
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newMessages: ExtendedMessage[] = [
      ...messages,
      {
        content: input,
        role: "user",
      },
    ];

    setMessages(newMessages);

    const result = await continueConversation(newMessages, sessionId);
    for await (const content of readStreamableValue(result.message)) {
      setMessages([
        ...newMessages,
        {
          id: result.id,
          role: "assistant",
          content: content as string,
        },
      ]);
    }

    router.push(`/chat/${sessionId}`, { scroll: false });
  };

  const handleFeedback = async (messageId: number, isLiked: boolean) => {
    try {
      await axios.post("/api/feedback", { body: { messageId, isLiked } });
      // Update the local state to reflect the feedback
      setMessages(
        messages.map((m) =>
          m.id === messageId ? { ...m, feedback: isLiked } : m
        )
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };
  return (
    <div className="flex justify-between">
      <History />
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content as string}
            {m.role === "assistant" && (
              <div className="inline-block ml-2">
                <button
                  className="mr-2"
                  onClick={() => handleFeedback(m.id!, true)}
                >
                  👍
                </button>
                <button onClick={() => handleFeedback(m.id!, false)}>👎</button>
              </div>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
