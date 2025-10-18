"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FaPlus, 
  FaRobot, 
  FaSearch,
  FaFilter,
  FaSort
} from 'react-icons/fa';
import AgentCard from '@/components/AgentCard';
import { useFetch } from '@/hooks/useAPiCall';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/navigation';

interface Agent {
  _id: string;
  name: string;
  query: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastExecuted?: string;
  nextExecution: string;
  executionCount: number;
  lastResults?: {
    houses?: any[];
    roommates?: any[];
    laws?: any[];
    summary?: string;
    executedAt: string;
  };
  createdAt: string;
}

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastExecuted' | 'nextExecution'>('created');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [executingAgents, setExecutingAgents] = useState<Set<string>>(new Set());
  
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  // Form state for creating/editing agents
  const [formData, setFormData] = useState({
    name: '',
    query: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly'
  });

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents`,
        'GET',
        null
      );
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    fetchAgents();
  }, [user, router]);

  // Filter and sort agents
  useEffect(() => {
    let filtered = agents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.query.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(agent =>
        filterStatus === 'active' ? agent.isActive : !agent.isActive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'lastExecuted':
          if (!a.lastExecuted && !b.lastExecuted) return 0;
          if (!a.lastExecuted) return 1;
          if (!b.lastExecuted) return -1;
          return new Date(b.lastExecuted).getTime() - new Date(a.lastExecuted).getTime();
        case 'nextExecution':
          return new Date(a.nextExecution).getTime() - new Date(b.nextExecution).getTime();
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, filterStatus, sortBy]);

  // Create agent
  const handleCreateAgent = async () => {
    try {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents`,
        'POST',
        formData
      );

      if (response.ok) {
        await fetchAgents();
        setShowCreateModal(false);
        setFormData({ name: '', query: '', frequency: 'weekly' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent');
    }
  };

  // Update agent
  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    try {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${editingAgent._id}`,
        'PUT',
        formData
      );

      if (response.ok) {
        await fetchAgents();
        setEditingAgent(null);
        setFormData({ name: '', query: '', frequency: 'weekly' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Failed to update agent');
    }
  };

  // Delete agent
  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`,
        'DELETE',
        null
      );

      if (response.ok) {
        await fetchAgents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    }
  };

  // Toggle agent active status
  const handleToggleActive = async (agentId: string, isActive: boolean) => {
    try {
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`,
        'PUT',
        { isActive }
      );

      if (response.ok) {
        await fetchAgents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('Failed to update agent');
    }
  };

  // Execute agent
  const handleExecuteAgent = async (agentId: string) => {
    try {
      setExecutingAgents(prev => new Set(prev).add(agentId));
      
      const response = await useFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}/execute`,
        'POST',
        null
      );

      if (response.ok) {
        await fetchAgents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to execute agent');
      }
    } catch (error) {
      console.error('Error executing agent:', error);
      alert('Failed to execute agent');
    } finally {
      setExecutingAgents(prev => {
        const newSet = new Set(prev);
        newSet.delete(agentId);
        return newSet;
      });
    }
  };

  // Handle edit
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      query: agent.query,
      frequency: agent.frequency
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaRobot className="mr-3 text-primary" />
                My Agents
              </h1>
              <p className="text-gray-600 mt-2">
                Automate your housing searches with recurring AI agents
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingAgent(null);
                setFormData({ name: '', query: '', frequency: 'weekly' });
                setShowCreateModal(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 h-4 w-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Agents</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <FaSort className="text-gray-400 h-4 w-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="lastExecuted">Last Executed</option>
                <option value="nextExecution">Next Execution</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <FaRobot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {agents.length === 0 ? 'No agents yet' : 'No agents match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {agents.length === 0 
                ? 'Create your first agent to automate housing searches'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {agents.length === 0 && (
              <Button
                onClick={() => {
                  setEditingAgent(null);
                  setFormData({ name: '', query: '', frequency: 'weekly' });
                  setShowCreateModal(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Create Your First Agent
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent._id}
                agent={agent}
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
                onToggleActive={handleToggleActive}
                onExecute={handleExecuteAgent}
                isExecuting={executingAgents.has(agent._id)}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., London Studio Search"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Query
                  </label>
                  <textarea
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="e.g., Find me a studio apartment in London under £1500/month near UCL"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
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
                    setShowCreateModal(false);
                    setEditingAgent(null);
                    setFormData({ name: '', query: '', frequency: 'weekly' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                  disabled={!formData.name || !formData.query}
                  className="bg-primary hover:bg-primary/90"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
