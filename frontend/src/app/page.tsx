"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Bookmark } from 'lucide-react';
import { useFetch } from '@/hooks/useAPiCall';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/FeaturedProperties/StatCard';
import { FaUser, FaHome, FaRobot } from 'react-icons/fa';
import ChainOfThoughtStep from '@/components/ChainOfThought';
import PropertyCard from '@/components/PropertyCard';
import RoommateCard from '@/components/RoommateCard';
import LegalCard from '@/components/LegalCard';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  type?: 'analysis' | 'status' | 'result' | 'regular';
  chainOfThought?: ChainOfThoughtData;
  structuredData?: any;
  originalQuery?: string; // Store the original user query for agent creation
};

type ChainOfThoughtStep = {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'completed';
  content?: string;
  details?: any;
};

type ChainOfThoughtData = {
  steps: ChainOfThoughtStep[];
  analysis?: any;
};

const Dashboard = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [usage, setUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null);
  const [currentChainOfThought, setCurrentChainOfThought] = useState<ChainOfThoughtData | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    query: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly'
  });
  const [savingAgent, setSavingAgent] = useState(false);
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Save query as agent
  const handleSaveAsAgent = (query: string) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    
    setAgentFormData({
      name: `Search: ${query.substring(0, 30)}${query.length > 30 ? '...' : ''}`,
      query: query,
      frequency: 'weekly'
    });
    setShowAgentModal(true);
  };

  // Create agent
  const handleCreateAgent = async () => {
    if (!user) return;

    try {
      setSavingAgent(true);
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents`,
        'POST',
        agentFormData
      );

      if (response.ok) {
        setShowAgentModal(false);
        setAgentFormData({ name: '', query: '', frequency: 'weekly' });
        // Show success message
        setMessages(prev => [...prev, {
          id: `agent-success-${Date.now()}`,
          role: 'assistant',
          content: `✅ Agent "${agentFormData.name}" created successfully! It will run ${agentFormData.frequency} and you can manage it in the Agents page.`,
          timestamp: Date.now(),
          type: 'regular'
        }]);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    } finally {
      setSavingAgent(false);
    }
  };

  // Format analysis data for display
  const formatAnalysis = (analysis: any) => {
    if (!analysis.isHousingRelated) {
      return '❌ This doesn\'t appear to be a housing-related query, but I\'ll try to help anyway!';
    }

    let formatted = '✅ Housing-related query detected\n\n';
    
    // Location
    if (analysis.location) {
      formatted += `📍 Location: ${analysis.location}\n\n`;
    }
    
    // Only show sections that have information
    const sections = [];
    
    if (analysis.houses?.hasInfo) {
      sections.push({
        icon: '🏠',
        title: 'Property Requirements',
        details: analysis.houses.details,
        keywords: analysis.houses.keywords
      });
    }
    
    if (analysis.roommates?.hasInfo) {
      sections.push({
        icon: '👥',
        title: 'Roommate Preferences',
        details: analysis.roommates.details,
        keywords: analysis.roommates.keywords
      });
    }
    
    if (analysis.laws?.hasInfo) {
      sections.push({
        icon: '⚖️',
        title: 'Legal/Regulatory Concerns',
        details: analysis.laws.details,
        keywords: analysis.laws.keywords
      });
    }
    
    // Format each section
    sections.forEach((section, index) => {
      formatted += `${section.icon} ${section.title}\n`;
      formatted += `${section.details}\n`;
      
      if (section.keywords && section.keywords.length > 0) {
        formatted += `Keywords: ${section.keywords.join(', ')}\n`;
      }
      
      // Add spacing between sections, but not after the last one
      if (index < sections.length - 1) {
        formatted += '\n';
      }
    });
    
    return formatted;
  };

  // Render structured data as cards
  const renderStructuredData = (data: any) => {
    if (!data) return null;

    return (
      <div className="space-y-6 mt-4">
        {/* Summary */}
        {data.summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800 text-sm">{data.summary}</p>
          </div>
        )}

        {/* Houses */}
        {data.houses && data.houses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🏠 Properties Found</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.houses.map((house: any, index: number) => (
                <PropertyCard key={index} {...house} />
              ))}
            </div>
          </div>
        )}

        {/* Roommates */}
        {data.roommates && data.roommates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Potential Roommates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.roommates.map((roommate: any, index: number) => (
                <RoommateCard key={index} {...roommate} />
              ))}
            </div>
          </div>
        )}

        {/* Legal Information */}
        {data.laws && data.laws.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⚖️ Legal Information</h3>
            <div className="space-y-3">
              {data.laws.map((law: any, index: number) => (
                <LegalCard key={index} {...law} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              content: "You have reached your OwlBot limit for this month. You'll get more access soon.",
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
      // Use fetch with streaming response instead of EventSource for better control
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `limit-${Date.now()}`,
            role: 'assistant',
            content: data?.message || "You have reached your OwlBot limit for this month.",
            timestamp: Date.now(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let analysisMessageId: string | null = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsLoading(false);
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                
                switch (eventData.type) {
                  case 'analysis':
                    // Initialize chain of thought
                    const initialSteps: ChainOfThoughtStep[] = [
                      {
                        id: 'analysis',
                        title: '🧠 Understanding your request',
                        status: 'completed',
                        content: formatAnalysis(eventData.data),
                        details: eventData.data
                      },
                      {
                        id: 'database',
                        title: '🔍 Searching our database',
                        status: 'pending'
                      },
                      {
                        id: 'web',
                        title: '🌐 Searching the web',
                        status: 'pending'
                      }
                    ];

                    const chainOfThought: ChainOfThoughtData = {
                      steps: initialSteps,
                      analysis: eventData.data
                    };

                    setCurrentChainOfThought(chainOfThought);

                    const chainMessage: ChatMessage = {
                      id: `chain-${Date.now()}`,
                      role: 'assistant',
                      content: '',
                      timestamp: Date.now(),
                      type: 'analysis',
                      chainOfThought: chainOfThought
                    };
                    
                    setMessages((prev) => [...prev, chainMessage]);
                    break;
                    
                  case 'status':
                    // Update chain of thought step status
                    setCurrentChainOfThought(prev => {
                      if (!prev) return prev;
                      
                      const updatedSteps = prev.steps.map(step => {
                        if (step.id === 'database' && eventData.data.message.includes('database')) {
                          return { ...step, status: 'loading' as const };
                        }
                        if (eventData.data.message.includes('web')) {
                          if (step.id === 'database') {
                            return { ...step, status: 'completed' as const };
                          }
                          if (step.id === 'web') {
                            return { ...step, status: 'loading' as const };
                          }
                        }
                        return step;
                      });
                      
                      return { ...prev, steps: updatedSteps };
                    });

                    // Update the chain message
                    setMessages(prev => prev.map(msg => {
                      if (msg.type === 'analysis' && msg.chainOfThought) {
                        return {
                          ...msg,
                          chainOfThought: {
                            ...msg.chainOfThought,
                            steps: msg.chainOfThought.steps.map(step => {
                              if (step.id === 'database' && eventData.data.message.includes('database')) {
                                return { ...step, status: 'loading' as const };
                              }
                              if (eventData.data.message.includes('web')) {
                                if (step.id === 'database') {
                                  return { ...step, status: 'completed' as const };
                                }
                                if (step.id === 'web') {
                                  return { ...step, status: 'loading' as const };
                                }
                              }
                              return step;
                            })
                          }
                        };
                      }
                      return msg;
                    }));
                    break;
                    
                  case 'database_result':
                    // Update database step with results
                    const dbContent = `Database search completed in ${eventData.data.executionTime}

📊 Search Results:
• Total results found: ${eventData.data.totalResults}
• Houses found: ${eventData.data.housesFound}
• Roommates found: ${eventData.data.roommatesFound}

🔍 Operations performed:
${eventData.data.searchQueries.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

✅ All database entries were analyzed using AI matching to find the most relevant results for your query.`;
                    
                    setCurrentChainOfThought(prev => {
                      if (!prev) return prev;
                      
                      const updatedSteps = prev.steps.map(step => {
                        if (step.id === 'database') {
                          return { 
                            ...step, 
                            status: 'completed' as const,
                            content: dbContent,
                            details: eventData.data
                          };
                        }
                        return step;
                      });
                      
                      return { ...prev, steps: updatedSteps };
                    });

                    // Update the chain message
                    setMessages(prev => prev.map(msg => {
                      if (msg.type === 'analysis' && msg.chainOfThought) {
                        return {
                          ...msg,
                          chainOfThought: {
                            ...msg.chainOfThought,
                            steps: msg.chainOfThought.steps.map(step => {
                              if (step.id === 'database') {
                                return { 
                                  ...step, 
                                  status: 'completed' as const,
                                  content: dbContent,
                                  details: eventData.data
                                };
                              }
                              return step;
                            })
                          }
                        };
                      }
                      return msg;
                    }));
                    break;
                    
                  case 'result':
                    // Complete all steps and show final result
                    setCurrentChainOfThought(prev => {
                      if (!prev) return prev;
                      const completedSteps = prev.steps.map(step => ({ ...step, status: 'completed' as const }));
                      return { ...prev, steps: completedSteps };
                    });

                    // Update chain message to completed
                    setMessages(prev => prev.map(msg => {
                      if (msg.type === 'analysis' && msg.chainOfThought) {
                        return {
                          ...msg,
                          chainOfThought: {
                            ...msg.chainOfThought,
                            steps: msg.chainOfThought.steps.map(step => ({ ...step, status: 'completed' as const }))
                          }
                        };
                      }
                      return msg;
                    }));

                    // Parse and display structured result
                    let structuredData = null;
                    try {
                      structuredData = JSON.parse(eventData.data.message);
                    } catch {
                      // If not JSON, treat as regular text
                    }

                    const resultMessage: ChatMessage = {
                      id: `result-${Date.now()}`,
                      role: 'assistant',
                      content: structuredData ? '' : (eventData.data.message || "I'm having trouble responding right now."),
                      timestamp: Date.now(),
                      type: 'result',
                      structuredData: structuredData,
                      originalQuery: text
                    };
                    setMessages((prev) => [...prev, resultMessage]);
                    break;
                    
                  case 'error':
                    const errorMessage: ChatMessage = {
                      id: `error-${Date.now()}`,
        role: 'assistant',
                      content: eventData.data.message || 'Sorry, something went wrong.',
        timestamp: Date.now(),
      };
                    setMessages((prev) => [...prev, errorMessage]);
                    break;
                    
                  case 'end':
                    setIsLoading(false);
                    return;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (e) {
      console.error('Fetch error:', e);
      const errorMessage: ChatMessage = {
        id: `fetch-error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong fetching a response.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
                    Meet <span className="text-primary">OwlBot</span>
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
                    {m.role === 'user' ? (
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow bg-blue-600 text-white">
                      {m.content}
                    </div>
                    ) : (
                      <div className="max-w-[90%] w-full">
                        {/* Chain of Thought Steps */}
                        {m.type === 'analysis' && m.chainOfThought && (
                          <div className="space-y-2">
                            {m.chainOfThought.steps.map((step) => (
                              <ChainOfThoughtStep
                                key={step.id}
                                title={step.title}
                                status={step.status}
                                content={step.content}
                                details={step.details}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Structured Data Results */}
                        {m.type === 'result' && m.structuredData && (
                          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                            {renderStructuredData(m.structuredData)}
                            {/* Save as Agent Button */}
                            {user && m.originalQuery && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                  onClick={() => handleSaveAsAgent(m.originalQuery!)}
                                  variant="outline"
                                  size="sm"
                                  className="text-primary hover:text-primary/80 border-primary hover:border-primary/80"
                                >
                                  <FaRobot className="mr-2 h-4 w-4" />
                                  Save as Agent
                                </Button>
                                <p className="text-xs text-gray-500 mt-1">
                                  Create a recurring agent to automatically run this search
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Regular Text Content */}
                        {m.content && !m.structuredData && m.type !== 'analysis' && (
                          <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow bg-gray-100 text-gray-900">
                            <div className="whitespace-pre-line">{m.content}</div>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 max-w-[80%] rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-900 shadow">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      Owlbot is processing your request...
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
              placeholder="Message OwlBot..."
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

      {/* Agent Creation Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Create Agent
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentFormData.name}
                  onChange={(e) => setAgentFormData({ ...agentFormData, name: e.target.value })}
                  placeholder="e.g., London Studio Search"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Query
                </label>
                <textarea
                  value={agentFormData.query}
                  onChange={(e) => setAgentFormData({ ...agentFormData, query: e.target.value })}
                  placeholder="Your search query..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={agentFormData.frequency}
                  onChange={(e) => setAgentFormData({ ...agentFormData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAgentModal(false);
                  setAgentFormData({ name: '', query: '', frequency: 'weekly' });
                }}
                disabled={savingAgent}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAgent}
                disabled={!agentFormData.name || !agentFormData.query || savingAgent}
                className="bg-primary hover:bg-primary/90"
              >
                {savingAgent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaRobot className="mr-2 h-4 w-4" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;