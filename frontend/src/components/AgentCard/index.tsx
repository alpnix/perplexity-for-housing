"use client";

import React, { useState } from 'react';
import { 
  FaClock, 
  FaPlay, 
  FaPause, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt,
  FaRobot,
  FaChartLine
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';

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

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agentId: string) => void;
  onToggleActive: (agentId: string, isActive: boolean) => void;
  onExecute: (agentId: string) => void;
  isExecuting?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  onToggleActive,
  onExecute,
  isExecuting = false
}) => {
  const [showResults, setShowResults] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '🗓️';
      default: return '⏰';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-gray-400';
  };

  const truncateQuery = (query: string, maxLength = 100) => {
    return query.length > maxLength ? `${query.substring(0, maxLength)}...` : query;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${
      agent.isActive ? 'border-l-green-500' : 'border-l-gray-300'
    } p-6 hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${agent.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <FaRobot className={`h-5 w-5 ${getStatusColor(agent.isActive)}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{getFrequencyIcon(agent.frequency)}</span>
              <span className="capitalize">{agent.frequency}</span>
              <span>•</span>
              <span className={`font-medium ${getStatusColor(agent.isActive)}`}>
                {agent.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExecute(agent._id)}
            disabled={!agent.isActive || isExecuting}
            className="text-blue-600 hover:text-blue-700"
          >
            <FaPlay className="h-3 w-3 mr-1" />
            {isExecuting ? 'Running...' : 'Run'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(agent._id, !agent.isActive)}
            className={agent.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
          >
            {agent.isActive ? <FaPause className="h-3 w-3" /> : <FaPlay className="h-3 w-3" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(agent)}
            className="text-gray-600 hover:text-gray-700"
          >
            <FaEdit className="h-3 w-3" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(agent._id)}
            className="text-red-600 hover:text-red-700"
          >
            <FaTrash className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Query */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {truncateQuery(agent.query)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaChartLine className="h-4 w-4 text-blue-500 mr-1" />
          </div>
          <div className="text-lg font-semibold text-gray-900">{agent.executionCount}</div>
          <div className="text-xs text-gray-500">Executions</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaClock className="h-4 w-4 text-green-500 mr-1" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {agent.lastExecuted ? formatDate(agent.lastExecuted) : 'Never'}
          </div>
          <div className="text-xs text-gray-500">Last Run</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FaCalendarAlt className="h-4 w-4 text-purple-500 mr-1" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {formatDate(agent.nextExecution)}
          </div>
          <div className="text-xs text-gray-500">Next Run</div>
        </div>
      </div>

      {/* Last Results */}
      {agent.lastResults && (
        <div className="border-t pt-4">
          <button
            onClick={() => setShowResults(!showResults)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Last Results</span>
            <span className={`transform transition-transform ${showResults ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showResults && (
            <div className="mt-3 space-y-2">
              {agent.lastResults.summary && (
                <p className="text-sm text-gray-600">{agent.lastResults.summary}</p>
              )}
              
              <div className="flex space-x-4 text-xs text-gray-500">
                {agent.lastResults.houses && agent.lastResults.houses.length > 0 && (
                  <span>🏠 {agent.lastResults.houses.length} properties</span>
                )}
                {agent.lastResults.roommates && agent.lastResults.roommates.length > 0 && (
                  <span>👥 {agent.lastResults.roommates.length} roommates</span>
                )}
                {agent.lastResults.laws && agent.lastResults.laws.length > 0 && (
                  <span>⚖️ {agent.lastResults.laws.length} legal items</span>
                )}
              </div>
              
              {agent.lastResults.executedAt && (
                <p className="text-xs text-gray-400">
                  Executed on {formatDate(agent.lastResults.executedAt)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentCard;
