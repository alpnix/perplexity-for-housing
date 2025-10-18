import React from 'react';

interface ActionButton {
  label: string; // Button label
  icon: React.ReactNode; // Icon component
  onClick: () => void; // Click handler
  className?: string; // Custom class for the button
}

interface ActionButtonsProps {
  buttons: ActionButton[]; // Array of action buttons
  className?: string; // Custom class for the buttons container
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ buttons, className = '' }) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={`flex items-center gap-2 p-2 text-sm rounded-lg transition-colors ${button.className}`}
        >
          {button.icon}
          <span>{button.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;