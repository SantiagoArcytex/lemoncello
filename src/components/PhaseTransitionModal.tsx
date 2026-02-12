import { Coffee, Play, AlertTriangle, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { getRandomPhrase } from '@/lib/lemonPhrases';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhaseTransitionModalProps {
  isOpen: boolean;
  transitionType: 'work-to-break' | 'break-to-work' | null;
  breakDuration: number;
  currentCycle: number;
  totalCycles: number;
  accumulatedRestTime: number;
  skippedBreaksCount: number;
  onConfirm: () => void;
  onKeepWorking: () => void;
  onStop: () => void;
}

export function PhaseTransitionModal({
  isOpen,
  transitionType,
  breakDuration,
  currentCycle,
  totalCycles,
  accumulatedRestTime,
  skippedBreaksCount,
  onConfirm,
  onKeepWorking,
  onStop,
}: PhaseTransitionModalProps) {
  const [showWarning, setShowWarning] = useState(false);
  const isBreakTime = transitionType === 'work-to-break';
  const phrase = useMemo(() => getRandomPhrase(), [isOpen]);
  
  // Calculate the break duration to display
  const displayBreakDuration = accumulatedRestTime > 0 ? accumulatedRestTime : breakDuration;
  // Next accumulated rest if they skip again
  const nextAccumulatedRest = accumulatedRestTime > 0 
    ? accumulatedRestTime + 5 
    : breakDuration;

  const handleKeepWorkingClick = () => {
    if (skippedBreaksCount > 0) {
      // Show warning dialog on subsequent skips
      setShowWarning(true);
    } else {
      // First skip - no warning needed
      onKeepWorking();
    }
  };

  const handleConfirmKeepWorking = () => {
    setShowWarning(false);
    onKeepWorking();
  };

  const handleTakeBreak = () => {
    setShowWarning(false);
    onConfirm();
  };

  return (
    <>
      <Dialog open={isOpen && !showWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="mx-auto mb-4"
            >
              {isBreakTime ? (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Coffee className="h-10 w-10 text-primary" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary" />
                </div>
              )}
            </motion.div>
            <DialogTitle className="text-2xl">
              {isBreakTime ? 'Break Time!' : 'Back to Work!'}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {isBreakTime
                ? `Great work! Take a ${displayBreakDuration} minute break.`
                : `Break's over! Ready for another shot?`}
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">{phrase}</p>
            {isBreakTime && accumulatedRestTime > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                (You've skipped {skippedBreaksCount} break{skippedBreaksCount > 1 ? 's' : ''} - rest time accumulated!)
              </p>
            )}
          </DialogHeader>
          <div className="mt-6 space-y-3">
            <Button
              variant="glow"
              size="xl"
              className="w-full"
              onClick={onConfirm}
            >
              {isBreakTime ? (
                <>
                  <Coffee className="h-5 w-5 mr-2" />
                  Start Break ({displayBreakDuration} min)
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Continue Work
                </>
              )}
            </Button>
            
            {isBreakTime && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleKeepWorkingClick}
              >
                <Play className="h-4 w-4 mr-2" />
                Keep Working
              </Button>
            )}

            {!isBreakTime && (
              <Button
                variant="outline"
                size="lg"
                className="w-full text-destructive hover:text-destructive"
                onClick={onStop}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Session
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Hey! You need to rest to be better! 🧠
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              You've already skipped {skippedBreaksCount} break{skippedBreaksCount > 1 ? 's' : ''}. 
              Your accumulated rest is now {displayBreakDuration} minutes.
              <br /><br />
              Sure you want to keep going? Your next break will be {nextAccumulatedRest} minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction 
              onClick={handleTakeBreak}
              className="w-full"
            >
              <Coffee className="h-4 w-4 mr-2" />
              You're right, let's take that rest
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={handleConfirmKeepWorking}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Yes, keep working
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
