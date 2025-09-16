import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold tracking-tight text-foreground">
        InsightMeet
      </span>
    </div>
  );
};

export default Logo;
