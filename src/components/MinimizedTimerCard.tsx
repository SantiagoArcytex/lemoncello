import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerState } from '@/types/blocks';

interface MinimizedTimerCardProps {
  timer: TimerState;
  onResume: (timerId: string) => void;
  onStop: (timerId: string) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function MinimizedTimerCard({ timer, onResume, onStop }: MinimizedTimerCardProps) {
  if (!timer.currentBlock) return null;

  const block = timer.currentBlock;
  const phaseLabel = timer.isWorkPhase ? 'Focus' : 'Break';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="p-4 rounded-xl bg-secondary/80 border border-border backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl flex-shrink-0">{block.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{block.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                Paused
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={timer.isWorkPhase ? 'text-primary' : 'text-muted-foreground'}>
                {phaseLabel}
              </span>
              <span>•</span>
              <span className="font-mono tabular-nums">{formatTime(timer.timeRemaining)}</span>
              {timer.workDescription && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{timer.workDescription}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="glow"
            size="sm"
            onClick={() => onResume(timer.id)}
            className="h-9 px-4"
          >
            <Play className="h-4 w-4 mr-1" />
            Continue
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onStop(timer.id)}
            className="h-9 w-9"
            title="Stop (save progress)"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
