"use client";
import { useEffect, useRef, useState } from "react";
import { readStreamableValue } from "ai/rsc";
import { useParams } from "next/navigation";
import axios from "axios";
import { continueConversation } from "@/app/actions";
import { marked } from "marked";
import History from "@/components/history";
import { ExtendedMessage, typeHistory } from "@/utils/types";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<typeHistory[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const params = useParams();
  const sessionId = params.slug;

  useEffect(() => {
    axios.post("/api/session/history", { body: { sessionId } }).then((res) => {
      setHistory(res.data);
    });
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessages: ExtendedMessage[] = [
      ...messages,
      {
        content: input,
        role: "user",
      },
    ];

    setMessages(newMessages);
    setInput("");
    try {
      const result = await continueConversation(
        newMessages,
        sessionId as string
      );
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
    } catch (err) {
      console.log(err);
    }
  };
  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  const handleFeedback = async (messageId: number, isLiked: boolean) => {
    try {
      await axios.post("/api/feedback", { body: { messageId, isLiked } });

      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m.id === messageId ? { ...m, feedback: isLiked } : m
        )
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const getMessageStyle = (role: string) => {
    return role === "user"
      ? "bg-blue-100 text-right rounded-br-none"
      : "bg-gray-100 text-left rounded-bl-none";
  };

  return (
    <div className="flex h-screen bg-gray-100 justify-center">
      <div className="flex w-full max-w-4xl px-4">
        <History />
        <div className="flex-grow flex flex-col ml-4 max-w-3xl">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {history.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg shadow ${getMessageStyle(
                  m.isAi ? "assistant" : "user"
                )}`}
              >
                <div
                  dangerouslySetInnerHTML={renderMarkdown(m.message_content)}
                />
                {m.isAi && m.feedback == null && (
                  <div className="space-x-2">
                    <button
                      className="mr-2"
                      onClick={() => handleFeedback(m.id!, true)}
                    >
                      ✅
                    </button>
                    <button onClick={() => handleFeedback(m.id!, false)}>
                      ❌
                    </button>
                  </div>
                )}
                {m.isAi && m.feedback != null && m.feedback.isLiked && (
                  <div>✅</div>
                )}
                {m.isAi && m.feedback != null && !m.feedback.isLiked && (
                  <div> ❌</div>
                )}
              </div>
            ))}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg shadow ${getMessageStyle(m.role)}`}
              >
                <div
                  dangerouslySetInnerHTML={renderMarkdown(m.content as string)}
                />
                {m.role === "assistant" && (
                  <div className="inline-block ml-2">
                    <button
                      className="mr-2"
                      onClick={() => handleFeedback(m.id!, true)}
                    >
                      ✅
                    </button>
                    <button onClick={() => handleFeedback(m.id!, false)}>
                      ❌
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md">
            <div className="flex items-center">
              <input
                className="flex-grow p-2 border border-gray-300 rounded-l-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                placeholder="Type your message..."
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
