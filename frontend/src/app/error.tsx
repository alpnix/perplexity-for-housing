'use client';

import EmptyState from '@/components/EmptyState';

interface ErrorStateProps {
  error: Error;
  reset: () => void;
}

const Error: React.FC<ErrorStateProps> = ({ error, reset }) => {
  return (
    <EmptyState
      title="Uh No!! There was a problem."
      subtitle={error.message || 'Something went wrong.'}
      illustration={"/assets/footer/get-started-background.jpeg"}
      showReset={false}
      label="Try again"
      reset={reset}
    />
  );
};

export default Error;
