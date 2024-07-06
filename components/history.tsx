"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const History: React.FC = () => {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    axios.get("/api/session/history").then((res) => {
      setHistory(res.data);
    });
  }, []);

  const router = useRouter();

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } flex flex-col z-10`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-10 top-4 bg-gray-800 text-white p-2 rounded-r-md"
      >
        {isOpen ? "←" : "→"}
      </button>
      <nav className="p-4 flex-grow overflow-y-auto">
        <ul className="space-y-2">
          <li className="hover:bg-gray-700 rounded-md">
            <button
              onClick={() => {
                router.push(`/`);
              }}
              className="w-full text-left p-2"
            >
              New Chat
            </button>
          </li>
          {history.map((item: { id: string }) => (
            <li key={item.id} className="hover:bg-gray-700 rounded-md">
              <button
                onClick={() => {
                  router.push(`/chat/${item.id}`);
                }}
                className="w-full text-left p-2 truncate"
              >
                {item.id}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default History;
