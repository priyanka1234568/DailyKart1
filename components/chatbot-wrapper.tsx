"use client";

import dynamic from 'next/dynamic';

// Dynamically import the Chatbot component with SSR disabled
const Chatbot = dynamic(() => import('@/components/chatbot'), { ssr: false });

export default function ChatbotWrapper() {
  return <Chatbot />;
}