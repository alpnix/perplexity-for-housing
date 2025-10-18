"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useFetch } from '@/hooks/useAPiCall';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/FeaturedProperties/StatCard';
import { FaUser, FaHome } from 'react-icons/fa';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
};

const Dashboard = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [usage, setUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Restore pending prompt from localStorage on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grotn_pending_prompt');
      if (saved && saved.trim().length > 0) {
        setInputValue(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;
    const element = textareaRef.current;
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 160) + 'px';
  }, [inputValue]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Gate: require auth before sending - save prompt and redirect to sign-in
    if (!user) {
      try { localStorage.setItem('grotn_pending_prompt', text); } catch {}
      router.push('/sign-in');
      return;
    }

    // If logged-in, check usage before sending
    if (user) {
      try {
        const resp = await useFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bot/usage`,
          'GET',
          null
        );
        const data = await resp.json();
        setUsage(data);
        if (data?.remaining !== undefined && data.remaining <= 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: `limit-${Date.now()}`,
              role: 'assistant',
              content: "You have reached your GrotBot limit for this month. You'll get more access soon.",
              timestamp: Date.now(),
            },
          ]);
          setInputValue('');
          return;
        }
      } catch {}
    }

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Clear any previously saved pending prompt now that we're sending
    try { localStorage.removeItem('grotn_pending_prompt'); } catch {}

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setHasStarted(true);

    try {
      const resp = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bot`,
        'POST',
        { prompt: text }
      );
      const data = await resp.json();
      if (resp.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            id: `limit-${Date.now()}`,
            role: 'assistant',
            content: data?.message || "You have reached your GrotBot limit for this month.",
            timestamp: Date.now(),
          },
        ]);
        return;
      }
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data?.message || "I'm having trouble responding right now.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const errorMessage: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong fetching a response.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-3xl h-[calc(100vh-64px)] overflow-hidden px-4">
        <div className="flex h-full flex-col pb-28">
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {!hasStarted && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  {/* Blurbs row - only when logged out */}
                  {!user && (
                    <div className="mb-6 flex items-center justify-center gap-3">
                      <div className="px-3 py-1 rounded-full border border-gray-300 bg-white/60 text-gray-700 text-xs md:text-sm flex items-center gap-2">
                        <img
                          src="https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/perplexity-color.png"
                          alt="Perplexity logo"
                          title="Perplexity AI"
                          className="h-4 w-4 object-contain"
                        />
                        Powered by Perplexity
                      </div>
                      <div className="px-3 py-1 rounded-full border border-gray-300 bg-white/60 text-gray-700 text-xs md:text-sm flex items-center gap-2">
                        <img src="https://companieslogo.com/img/orig/AMZN-e9f942e4.png?t=1740113564" alt="Amazon" className="h-4 w-4 object-contain rounded-sm" />
                        Built by alumni from Amazon
                      </div>
                    </div>
                  )}
                  <h1 className="font-poppins text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                    Meet <span className="text-primary">GrotBot</span>
                  </h1>
                  <p className="mt-3 text-base md:text-2xl text-gray-600">your AI rental assistant</p>
                  {!user && (
                    <div className="mt-10 max-w-3xl mx-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                        <StatCard Icon={FaUser} label="Satisfied Users." value="520+" />
                        <StatCard Icon={FaHome} label="Available Properties." value="20000+" />
                      </div>
                    </div>
                  )}
                </div>
            </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {m.content}
                    </div>
                    </div>
                  ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-900 shadow">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      GrotBot is thinking...
                    </div>
                </div>
                )}
                <div ref={scrollAnchorRef} />
              </div>
            )}
                      </div>
                </div>
              </div>
              
      {/* Sticky composer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message GrotBot..."
              className="min-h-[44px] max-h-40 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={handleSend} disabled={isLoading || inputValue.trim().length === 0} className="h-10 px-4 text-white" aria-label="Send message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? 'Sending' : 'Send'}
            </Button>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">Press Enter to send • Shift + Enter for a new line</div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;