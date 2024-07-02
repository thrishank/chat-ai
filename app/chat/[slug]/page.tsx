"use client";

import { type CoreMessage } from "ai";
import { useEffect, useState } from "react";

import { readStreamableValue } from "ai/rsc";
import { useParams } from "next/navigation";
import axios from "axios";
import { continueConversation } from "@/app/actions";
import { marked } from "marked";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface typeHistory {
  id: number;
  message_content: string;
  isAi: boolean;
}
export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<typeHistory[]>([]);

  const params = useParams();
  const sessionId = params.slug;

  useEffect(() => {
    axios.post("/api/session/history", { body: { sessionId } }).then((res) => {
      setHistory(res.data);
    });
  }, [sessionId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newMessages: CoreMessage[] = [
      ...messages,
      {
        content: input,
        role: "user",
      },
    ];

    setMessages(newMessages);
    setInput("");

    const result = await continueConversation(newMessages, sessionId as string);
    for await (const content of readStreamableValue(result.message)) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: content as string,
        },
      ]);
    }
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-4xl py-24 mx-auto stretch bg-[#212121] text-white">
      <div className="px-4">
        {history.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              m.isAi ? `text-normal` : `text-right`
            }`}
          >
            <div dangerouslySetInnerHTML={renderMarkdown(m.message_content)} />
          </div>
        ))}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              m.role === "user" ? `text-right` : `text-normal`
            }`}
          >
            {m.role === "user" ? "User: " : "AI: "}
            {m.content as string}
            {m.role === "assistant" && (
              <div className="inline-block ml-2">
                <button className="mr-2">👍</button>
                <button>👎</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex justify-center">
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black "
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
