import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ActiveCallProps {
  startTime: Date;
  onStop: (description: string) => void;
  onCancel: () => void;
}

export function ActiveCall({ startTime, onStop, onCancel }: ActiveCallProps) {
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (description.trim()) {
      onStop(description.trim());
    } else {
      setShowStopConfirm(true);
    }
  };

  const confirmStop = () => {
    onStop(description.trim() || 'Call session');
    setShowStopConfirm(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Call Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-call/20 mb-4"
          >
            <Phone className="h-10 w-10 text-call" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Call in Progress</h1>
          <p className="text-muted-foreground">Tracking your call time</p>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-call tabular-nums">
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Description Field */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Call Notes (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this call..."
            className="min-h-[100px] bg-secondary/50 border-border"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleStop}
            className="flex-1 bg-call hover:bg-call/90 text-white"
          >
            <Square className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>

        {/* Stop Confirmation */}
        {showStopConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-secondary border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3">
              No notes added. End call anyway?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStopConfirm(false)}
                className="flex-1"
              >
                Add Notes
              </Button>
              <Button
                size="sm"
                onClick={confirmStop}
                className="flex-1 bg-call hover:bg-call/90"
              >
                End Call
              </Button>
            </div>
          </motion.div>
        )}

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
          >
            <p className="text-sm text-destructive mb-3">
              ⚠️ Canceling will permanently discard this call record. No time will be saved.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1"
              >
                Keep Call
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
                className="flex-1"
              >
                Discard Call
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
