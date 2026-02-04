import { Coffee, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PhaseTransitionModalProps {
  isOpen: boolean;
  transitionType: 'work-to-break' | 'break-to-work' | null;
  breakDuration: number;
  currentCycle: number;
  totalCycles: number;
  onConfirm: () => void;
}

export function PhaseTransitionModal({
  isOpen,
  transitionType,
  breakDuration,
  currentCycle,
  totalCycles,
  onConfirm,
}: PhaseTransitionModalProps) {
  const isBreakTime = transitionType === 'work-to-break';

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
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
              ? `Great work! Take a ${breakDuration} minute break.`
              : `Break finished. Cycle ${currentCycle} of ${totalCycles > 100 ? '∞' : totalCycles}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button
            variant="glow"
            size="xl"
            className="w-full"
            onClick={onConfirm}
          >
            {isBreakTime ? (
              <>
                <Coffee className="h-5 w-5 mr-2" />
                Start Break
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Continue Work
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
