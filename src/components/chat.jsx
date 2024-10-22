"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { useEffect, useRef, useState } from "react";

export function Chat() {
  const containerRef = useRef(null);

  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log("messages", messages);
    if(messages.length >1 && isLoading){
      callAPIChat()
    }
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages, isLoading]);
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages([...messages, { role: "human", content: input }]);
    setIsLoading(true)
  };

  const callAPIChat = async () => {
    setIsLoading(true);
    const mes = input;
    setInput("");
    const res = await fetch("api/chat", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      //make sure to serialize your JSON body
      body: JSON.stringify({
        message: mes,
      }),
    });
    const text = await res.json();
    if(text){
      setIsLoading(false);
      setMessages([...messages, { role: "assistant", content: text.message }]);
    }
   
  };

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map((mes, index) => (
          <div key={index}>
            <ChatLine role={mes.role} content={mes.content} />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2"
        />

        <Button type="submit" className="w-24">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}
