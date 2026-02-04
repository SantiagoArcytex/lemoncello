import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, Zap, Play, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableBlockCard } from './DraggableBlockCard';
import { CreateBlockModal } from './CreateBlockModal';
import { TaskPanel } from './TaskPanel';
import { MinimizedTimerCard } from './MinimizedTimerCard';
import { TimerBlock, Task, TimerState } from '@/types/blocks';

interface BlockLibraryProps {
  blocks: TimerBlock[];
  onStartBlock: (block: TimerBlock, taskId?: string, taskName?: string) => void;
  onUpdateBlock: (id: string, updates: Partial<TimerBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onCreateBlock: (block: Omit<TimerBlock, 'id' | 'createdAt'>) => void;
  onReorderBlocks: (blocks: TimerBlock[]) => void;
  onQuickStart: () => void;
  onStartCall: () => void;
  todayMinutes: number;
  tasks: Task[];
  onAddTask: (title: string, description: string) => void;
  onCompleteTask: (id: string) => void;
  onUncompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  hasIncompleteSprint: (taskId: string) => boolean;
  minimizedTimers: TimerState[];
  onResumeMinimized: (timerId: string) => void;
  onStopMinimized: (timerId: string) => void;
}

export function BlockLibrary({
  blocks,
  onStartBlock,
  onUpdateBlock,
  onDeleteBlock,
  onCreateBlock,
  onReorderBlocks,
  onQuickStart,
  onStartCall,
  todayMinutes,
  tasks,
  onAddTask,
  onCompleteTask,
  onUncompleteTask,
  onDeleteTask,
  hasIncompleteSprint,
  minimizedTimers,
  onResumeMinimized,
  onStopMinimized,
}: BlockLibraryProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleStartSprintFromTask = (task: Task, block: TimerBlock) => {
    onStartBlock(block, task.id, task.title);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newBlocks = [...blocks];
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(dragOverIndex, 0, draggedBlock);
      onReorderBlocks(newBlocks);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
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
            <Zap className="h-8 w-8 stroke-animated" />
            <h1 className="text-3xl font-bold text-gradient-stroke">Lemoncello</h1>
          </div>
          <p className="text-muted-foreground">Your productivity powerhouse</p>
        </div>

        {/* Today's Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20"
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

        {/* Minimized Timers */}
        <AnimatePresence>
          {minimizedTimers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-3"
            >
              {minimizedTimers.map((timer) => (
                <MinimizedTimerCard
                  key={timer.id}
                  timer={timer}
                  onResume={onResumeMinimized}
                  onStop={onStopMinimized}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Working Button - Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-3"
        >
          <Button
            variant="glow"
            size="xl"
            onClick={onQuickStart}
            className="w-full h-16 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Working!
          </Button>
        </motion.div>

        {/* Start a Call Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Button
            size="lg"
            onClick={onStartCall}
            className="w-full h-12 bg-call hover:bg-call/90 text-call-foreground"
          >
            <Phone className="h-5 w-5 mr-2" />
            Start Meeting
          </Button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3 mb-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsTaskPanelOpen(true)}
            className="flex-1"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Tasks
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
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Blocks</h2>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <DraggableBlockCard
                key={block.id}
                block={block}
                onStart={onStartBlock}
                onUpdate={onUpdateBlock}
                onDelete={onDeleteBlock}
                index={index}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
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

      <TaskPanel
        isOpen={isTaskPanelOpen}
        onClose={() => setIsTaskPanelOpen(false)}
        tasks={tasks}
        onAddTask={onAddTask}
        onCompleteTask={onCompleteTask}
        onUncompleteTask={onUncompleteTask}
        onDeleteTask={onDeleteTask}
        onStartSprint={handleStartSprintFromTask}
        blocks={blocks}
        hasIncompleteSprint={hasIncompleteSprint}
      />
    </div>
  );
}
