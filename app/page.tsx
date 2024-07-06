"use client";

import { useEffect, useState } from "react";
import { continueConversation } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { useRouter } from "next/navigation";
import axios from "axios";
import History from "@/components/history";
import { ExtendedMessage } from "@/utils/types";
import { marked } from "marked";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

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

  return (
    <div className="flex justify-between">
      <History />
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}

            <div
              dangerouslySetInnerHTML={renderMarkdown(m.content as string)}
            />
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
