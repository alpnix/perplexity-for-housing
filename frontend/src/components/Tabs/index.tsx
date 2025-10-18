import React from 'react';

interface TabsProps {
  tabs: string[]; // Array of tab names
  activeTab: string; // Currently active tab
  onTabClick: (tab: string) => void; // Handler for tab clicks
  tabClassName?: string; // Custom class for tab buttons
  activeTabClassName?: string; // Custom class for the active tab
  inactiveTabClassName?: string; // Custom class for inactive tabs
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabClick,
  tabClassName = 'py-4 px-1 border-b-2 font-medium text-sm',
  activeTabClassName = 'border-primary text-primary',
  inactiveTabClassName = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}) => {
  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={`${tabClassName} ${
              activeTab === tab ? activeTabClassName : inactiveTabClassName
            }`}
          >
            {tab.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;