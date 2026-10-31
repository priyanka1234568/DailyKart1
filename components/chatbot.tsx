"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 Welcome to DailyKart! I\'m here to help you with your grocery shopping. How can I assist you today? 🛒',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses: {[key: string]: string} = {
        'hello': 'Hi there! 👋 Welcome to DailyKart! How can I assist you with your grocery shopping today?',
        'hi': 'Hello! 🛒 Welcome to DailyKart! How can I help you with your shopping experience?',
        'help': 'I can help you with: 🥬 Product information, 📦 Order status, 🚚 Delivery details, 💳 Payment options, and more! What do you need assistance with?',
        'product': 'We have a wide range of fresh products: 🍎 Fruits, 🥕 Vegetables, and 🌾 Grains. Are you looking for something specific?',
        'shipping': 'We deliver fresh groceries within 24 hours! 🚚 Delivery charges are ₹2. Free delivery on orders above ₹500!',
        'delivery': 'We offer fast delivery within 24 hours of your order! 🚚 Delivery charges are ₹50.',
        'return': 'Our return policy allows returns within 48 hours of delivery. Fresh groceries are returnable if they don\'t meet quality standards. 📦',
        'payment': 'We accept: 💳 Cash on Delivery (COD) and 💰 Online Payment (UPI). Choose whatever is convenient for you!',
        'cod': 'Yes! We offer Cash on Delivery (COD). You can pay when your order arrives at your doorstep! 💵',
        'online': 'Yes! We accept Online Payment via UPI. You can pay securely during checkout! 💰',
        'discount': 'Use code WELCOME10 for 10% off your first order! 🎉',
        'price': 'We offer competitive prices on all our fresh groceries! Check our shop page for current prices. 💰',
        'contact': 'You can reach our customer service at support@dailykart.com 📧 or contact us for any queries!',
        'hours': 'Our customer service is available Monday to Sunday, 9 AM to 9 PM IST. ⏰',
        'order': 'To place an order: 1) Browse products in Shop 📱 2) Add to cart 🛒 3) Checkout 💳 4) Receive within 24 hours! 🚚',
        'fresh': 'All our products are fresh and handpicked daily! 🥬 We ensure quality and freshness. 🌟',
        'organic': 'We source fresh, organic products directly from trusted suppliers! 🌱 Quality guaranteed! ✨'
      };
      
      // Check if the user's message contains any keywords
      const userMessageLower = userMessage.text.toLowerCase();
      let botReply = 'I\'m here to help with your grocery shopping! 🛒 Feel free to ask about: 🥬 Products, 🚚 Delivery (24 hours!), 💳 Payment options, 📦 Orders, or anything else! How can I assist you?';
      
      // Check for multiple keyword matches and provide the most relevant response
      for (const [keyword, response] of Object.entries(botResponses)) {
        if (userMessageLower.includes(keyword)) {
          botReply = response;
          break;
        }
      }
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={toggleChat}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </Button>
      </div>
      
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 md:w-96 shadow-2xl flex flex-col max-h-[500px] overflow-hidden border-0 bg-white/95 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 font-semibold flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>DailyKart Support</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={toggleChat}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 max-h-[350px]">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
                      : 'bg-gradient-to-r from-blue-50 to-green-50 text-gray-800 border border-blue-200'
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button type="submit" size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}