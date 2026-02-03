import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface QuickStartButtonProps {
  onQuickStart: () => void;
  isTimerActive: boolean;
}

export function QuickStartButton({ onQuickStart, isTimerActive }: QuickStartButtonProps) {
  if (isTimerActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 right-4 z-40"
    >
      <Button
        variant="glow"
        size="lg"
        onClick={onQuickStart}
        className="rounded-full h-14 px-6 shadow-lg"
      >
        <Play className="h-5 w-5 mr-2" />
        Inicio Rápido
      </Button>
    </motion.div>
  );
}
