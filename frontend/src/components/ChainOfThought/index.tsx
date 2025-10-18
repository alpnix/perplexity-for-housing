import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Loader2 } from 'lucide-react';

interface ChainOfThoughtStepProps {
  title: string;
  status: 'pending' | 'loading' | 'completed';
  content?: string;
  details?: any;
}

export const ChainOfThoughtStep: React.FC<ChainOfThoughtStepProps> = ({
  title,
  status,
  content,
  details
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 transition-all duration-200 ${getStatusColor()}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => status === 'completed' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {status === 'completed' && (content || details) && (
          <button className="text-gray-500 hover:text-gray-700">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {isExpanded && (content || details) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {content && (
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {content}
            </div>
          )}
          {details && (
            <div className="text-sm text-gray-700">
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChainOfThoughtStep;
