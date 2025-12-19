import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerRing } from './TimerRing';
import { TimerState, TimerBlock } from '@/types/blocks';

interface ActiveTimerProps {
  timerState: TimerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onUpdateDescription: (desc: string) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getPhaseLabel(state: TimerState): string {
  if (!state.currentBlock) return '';
  
  const block = state.currentBlock;
  
  if (block.type === 'meeting') return 'Meeting';
  if (block.type === 'rest') return 'Rest Time';
  
  return state.isWorkPhase ? 'Focus' : 'Break';
}

function getTotalDuration(block: TimerBlock, isWorkPhase: boolean): number {
  if (block.type === 'meeting') return block.workDuration * 60;
  if (block.type === 'rest') return block.restDuration * 60;
  return isWorkPhase ? block.workDuration * 60 : block.restDuration * 60;
}

export function ActiveTimer({
  timerState,
  onPause,
  onResume,
  onStop,
  onUpdateDescription,
}: ActiveTimerProps) {
  if (!timerState.currentBlock) return null;

  const block = timerState.currentBlock;
  const totalDuration = getTotalDuration(block, timerState.isWorkPhase);
  const progress = 1 - timerState.timeRemaining / totalDuration;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8"
    >
      {/* Block Name */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <span className="text-4xl mb-2">{block.icon}</span>
        <h2 className="text-2xl font-bold text-foreground">{block.name}</h2>
        <p className={`text-lg font-medium mt-1 ${timerState.isWorkPhase ? 'text-primary' : 'text-muted-foreground'}`}>
          {getPhaseLabel(timerState)}
        </p>
      </motion.div>

      {/* Timer Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative flex items-center justify-center mb-8"
      >
        <TimerRing 
          progress={progress} 
          size={280} 
          strokeWidth={8}
          isWorkPhase={timerState.isWorkPhase}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={timerState.timeRemaining}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="text-6xl font-bold tracking-tight text-foreground tabular-nums"
          >
            {formatTime(timerState.timeRemaining)}
          </motion.span>
          {block.cycles > 1 && block.type === 'pomodoro' && (
            <span className="text-sm text-muted-foreground mt-2">
              Cycle {timerState.currentCycle} of {block.cycles}
            </span>
          )}
        </div>
      </motion.div>

      {/* Control Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 mb-10"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={onStop}
          className="h-14 w-14 rounded-full"
        >
          <Square className="h-5 w-5" />
        </Button>
        
        <Button
          variant={timerState.isRunning ? "outline" : "glow"}
          size="xl"
          onClick={timerState.isRunning ? onPause : onResume}
          className="h-16 w-32 rounded-full"
        >
          {timerState.isRunning ? (
            <>
              <Pause className="h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Resume
            </>
          )}
        </Button>
      </motion.div>

      {/* Work Description */}
      {(block.type === 'pomodoro' || block.type === 'meeting') && timerState.isWorkPhase && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md"
        >
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            What are you working on?
          </label>
          <textarea
            value={timerState.workDescription}
            onChange={(e) => onUpdateDescription(e.target.value)}
            placeholder="Describe your current task..."
            className="w-full h-24 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
