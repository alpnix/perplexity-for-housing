import React, { ReactNode } from 'react';

interface CardProps {
  image?: string; // Image URL
  title?: string; // Title of the card
  subtitle?: string; // Subtitle (optional)
  description?: string; // Description text
  tags?: string[]; // Tags or hobbies (optional)
  className?: string; // Custom class for the card container
  children?: ReactNode; // Action buttons or other content
}

const Card: React.FC<CardProps> = ({
  image,
  title,
  subtitle,
  description,
  tags,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        {tags && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {children && <div className="mt-4 flex gap-3">{children}</div>}
      </div>
    </div>
  );
};

export default Card;