"use client";

import { useChat } from "ai/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, data } = useChat();

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {data && <pre className="mb-4">{JSON.stringify(data, null, 2)}</pre>}

      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap mb-2">
            <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
            {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md">
        <input
          className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
