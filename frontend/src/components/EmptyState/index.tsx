'use client';

import { useRouter } from 'next/navigation';

import Button from './Button';
import Heading from './Heading';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  illustration?: string;
  showReset?: boolean;
  label?: string;
  reset?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No exact matches',
  subtitle = 'Try changing or removing some of your filters.',
  label = 'Remove all filters',
  illustration = '/assets/not-found.svg',
  showReset,
  reset,
}) => {
  const router = useRouter();

  return (
    <div
      className="
        h-[60vh]
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center 
      "
    >
      <Heading center title={title} subtitle={subtitle} />
      <img
        src={illustration}
        alt="Not Found"
        className="animate-fade-in"
      />
      <div
        className="w-48 mt-4 flex 
        flex-row 
        gap-2 "
      >
        
        {showReset && (
          <Button
            outline
            label={label ?? 'Remove all filters'}
            onClick={() => reset && reset()}
          />
        )}
        <Button outline label="Go Back" onClick={() => router.push('/')} />
      </div>
    </div>
  );
};

export default EmptyState;
