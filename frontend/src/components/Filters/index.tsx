import React from 'react';

interface FiltersProps {
  filters: {
    label: string; // Label for the filter
    type: 'select' | 'tags'; // Type of filter (dropdown or tags)
    options: string[]; // Options for the filter
    selected: string | string[]; // Currently selected value(s)
    onChange: (value: string | string[]) => void; // Handler for filter changes
  }[];
  className?: string; // Custom class for the filters container
}

const Filters: React.FC<FiltersProps> = ({ filters, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 mb-8 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={filter.selected as string}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      const selected = filter.selected as string[];
                      filter.onChange(
                        selected.includes(option)
                          ? selected.filter((item) => item !== option)
                          : [...selected, option]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      (filter.selected as string[]).includes(option)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;