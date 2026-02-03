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
            {isBreakTime ? '¡Hora del Descanso!' : '¡Vamos a Trabajar!'}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {isBreakTime
              ? `Has completado tu tiempo de trabajo. Toma un descanso de ${breakDuration} minutos.`
              : `Descanso terminado. Ciclo ${currentCycle} de ${totalCycles}.`}
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
                Iniciar Descanso
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Continuar Trabajo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
