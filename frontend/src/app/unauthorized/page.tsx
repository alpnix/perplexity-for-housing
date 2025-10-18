'use client';

import EmptyState from '@/components/EmptyState';


const UnauthorizeState: React.FC = () => {
  
  return (
    <EmptyState
      title="Uh No"
      subtitle="You don't have permission for this resource"
      showReset
      label="Go back home"
    />
  );
};

export default UnauthorizeState;