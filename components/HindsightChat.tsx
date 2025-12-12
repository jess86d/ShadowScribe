import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const HindsightChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hindsight360 online. I can help you write verses, fix your mix, or legally protect this track. What are we working on?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text);
      if (responseText) {
        setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
      }
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Connection disrupted. Try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-neon-purple text-white shadow-lg shadow-neon-purple/50 z-50 transition-all hover:scale-110 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-shadow-800 border border-neon-purple rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md bg-opacity-95">
          {/* Header */}
          <div className="p-3 border-b border-shadow-700 flex justify-between items-center bg-neon-purple/10">
            <div className="flex items-center gap-2">
                <Bot size={18} className="text-neon-purple" />
                <h3 className="font-display font-bold text-neon-purple">Hindsight360</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-neon-purple/20 text-white rounded-br-none border border-neon-purple/30' 
                    : 'bg-shadow-700 text-gray-200 rounded-bl-none border border-shadow-600'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-shadow-700 text-gray-400 p-2 rounded-lg text-xs animate-pulse">
                  Hindsight is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-shadow-700 bg-shadow-900">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-shadow-800 border border-shadow-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-purple"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="p-2 bg-neon-purple/20 hover:bg-neon-purple/40 text-neon-purple rounded-md transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};