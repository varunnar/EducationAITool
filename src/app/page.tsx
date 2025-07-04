'use client';
import Image from "next/image";
import { useState } from "react";
import Response from "@/components/responseBubble";


class conversationType {
  gemini: boolean;
  content: string;
  constructor(gemini: boolean, content: string) {
    this.gemini = gemini;
    this.content = content;
  }
}

export default function Home() {

  const [conversationList, setConversationList] = useState<conversationType[]>([]);

  const [request, setRequest] = useState('');

  const getGeminiResponse = async (prompt: string) => {
    const prompt_obj = new conversationType(false, prompt);
    setConversationList([...conversationList, prompt_obj]);
    
    try {
      // Include conversation history in the API call
      const historyParam = encodeURIComponent(JSON.stringify(conversationList));
      const response = await fetch(`/api/gemini?prompt=${encodeURIComponent(prompt)}&history=${historyParam}`);
      console.log("response", response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("data", data);
      
      const responseText = data.text || data.error || "No response";
      const response_obj = new conversationType(true, responseText);
      setConversationList(prev => [...prev, response_obj]);

      console.log("ConversationList", conversationList);
      return data;
    } catch (error) {
      console.error("Error fetching response:", error);
      const error_obj = new conversationType(true, "Error: Failed to get response");
      setConversationList(prev => [...prev, error_obj]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim()) {
      await getGeminiResponse(request);
      setRequest(''); // Clear the input after submission
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-between align-items-space-between min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-start">
        <h1>Welcome to your AI Tutor Bot</h1>
        <h2>Your Homework Helper and Teacher</h2>
      </div>
      <div id="conversationContainer" className="w-full flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col justify-end w-full">
          {
            conversationList.map((x: conversationType, index: number) => (
              <Response key={index} gemini={x.gemini} content={x.content}/>
            ))
          }
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-row items-center justify-between w-full gap-2">
        <div className="bg-stone-700 p-2 w-full rounded-md">
          <input 
            type="text" 
            className="w-full border-radius-1" 
            placeholder="Add your first homework request" 
            value={request} 
            onChange={(e) => setRequest(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md min-w-60">Get Gemini Response</button>
      </form>
    </div>
  );
}
