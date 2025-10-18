import React from 'react';
import { Scale, ExternalLink } from 'lucide-react';

interface LegalCardProps {
  title: string;
  description: string;
  jurisdiction: string;
  source_url?: string;
  relevance?: string;
}

export const LegalCard: React.FC<LegalCardProps> = ({
  title,
  description,
  jurisdiction,
  source_url,
  relevance
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-amber-200 p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Scale className="h-6 w-6 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          
          <div className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded mb-3 inline-block">
            {jurisdiction}
          </div>

          <p className="text-gray-700 text-sm mb-3">{description}</p>

          {relevance && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
              <p className="text-blue-800 text-sm">
                <strong>Relevance:</strong> {relevance}
              </p>
            </div>
          )}

          {source_url && (
            <a 
              href={source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              Learn More
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalCard;
