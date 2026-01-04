"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about our catalog, and provide recommendations. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare conversation history for the API (exclude the initial greeting)
      const conversationHistory = messages
        .filter((msg) => msg.role !== "assistant" || msg.content !== "Hello! I'm your AI shopping assistant. I can help you find products, answer questions about our catalog, and provide recommendations. How can I assist you today?")
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Chatbot error:", error);
      toast.error("Failed to get response", {
        description: error.message || "Please try again later.",
      });

      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating AI Chat Button - Bottom Right */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white border-2 border-white/10 hover:border-white/20 group"
        aria-label="Open AI chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        )}
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></span>
        )}
      </Button>

      {/* Chat Window Popup */}
      {isOpen && (
        <Card className="fixed bottom-24 right-2 sm:right-6 z-[99] w-[calc(100vw-1rem)] sm:w-[400px] h-[500px] sm:h-[600px] flex flex-col shadow-2xl border-gray-200 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-900 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">AI Shopping Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about products..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gray-900 hover:bg-gray-800"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about products, prices, categories, or get recommendations
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
