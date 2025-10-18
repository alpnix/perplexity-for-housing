'use client';

import { useEffect } from 'react';
import EmptyState from '@/components/EmptyState';

interface NotFoundStateProps {
  error: Error;
}

const NotFound: React.FC<NotFoundStateProps> = ({ error }) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">      
      <EmptyState
        title="Page Not Found"
        subtitle="Sorry, the page you are looking for does not exist."
        showReset={false}
        label="Go back home"
      />
    </div>
  );
};

export default NotFound;
