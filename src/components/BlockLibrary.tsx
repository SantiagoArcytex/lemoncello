import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockCard } from './BlockCard';
import { CreateBlockModal } from './CreateBlockModal';
import { TimerBlock } from '@/types/blocks';

interface BlockLibraryProps {
  blocks: TimerBlock[];
  onStartBlock: (block: TimerBlock) => void;
  onUpdateBlock: (id: string, updates: Partial<TimerBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onCreateBlock: (block: Omit<TimerBlock, 'id' | 'createdAt'>) => void;
  todayMinutes: number;
}

export function BlockLibrary({
  blocks,
  onStartBlock,
  onUpdateBlock,
  onDeleteBlock,
  onCreateBlock,
  todayMinutes,
}: BlockLibraryProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleQuickMeeting = () => {
    const meetingBlock: TimerBlock = {
      id: 'quick-meeting-' + Date.now(),
      name: 'Quick Meeting',
      type: 'meeting',
      workDuration: 30,
      restDuration: 0,
      cycles: 1,
      icon: '📞',
      createdAt: new Date(),
    };
    onStartBlock(meetingBlock);
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Lemoncello</h1>
          </div>
          <p className="text-muted-foreground">Your productivity powerhouse</p>
        </div>

        {/* Today's Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground mb-1">Today's Focus</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">
              {Math.floor(todayMinutes / 60)}
            </span>
            <span className="text-lg text-muted-foreground">hours</span>
            <span className="text-4xl font-bold text-primary">
              {todayMinutes % 60}
            </span>
            <span className="text-lg text-muted-foreground">min</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 mb-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleQuickMeeting}
            className="flex-1"
          >
            <Phone className="h-4 w-4 mr-2" />
            30min Meeting
          </Button>
          <Button
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Block
          </Button>
        </motion.div>

        {/* Block Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Blocks</h2>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                onStart={onStartBlock}
                onUpdate={onUpdateBlock}
                onDelete={onDeleteBlock}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {blocks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">🍋</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No blocks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first routine block to get started
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Block
            </Button>
          </motion.div>
        )}
      </motion.div>

      <CreateBlockModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBlock={onCreateBlock}
      />
    </div>
  );
}
