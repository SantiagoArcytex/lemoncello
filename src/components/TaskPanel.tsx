import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Play, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Task, TimerBlock } from '@/types/blocks';

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddTask: (title: string, description: string) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStartSprint: (task: Task, block: TimerBlock) => void;
  blocks: TimerBlock[];
  hasIncompleteSprint: (taskId: string) => boolean;
}

export function TaskPanel({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
  onStartSprint,
  blocks,
  hasIncompleteSprint,
}: TaskPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTimerSelect, setShowTimerSelect] = useState(false);

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const workBlocks = blocks.filter(b => b.type === 'pomodoro');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTimerSelect(true);
  };

  const handleSelectTimer = (block: TimerBlock) => {
    if (selectedTask) {
      onStartSprint(selectedTask, block);
      setShowTimerSelect(false);
      setSelectedTask(null);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Tasks</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Add Task Form */}
              <div className="p-4 border-b border-border space-y-3">
                <Input
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                />
                <Textarea
                  placeholder="Description (optional)..."
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Task List */}
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                {activeTasks.length > 0 ? (
                  <div className="space-y-3">
                    {activeTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group hover:border-primary/50 transition-colors">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => onCompleteTask(task.id)}
                                className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <CheckCircle2 className="h-5 w-5" />
                              </button>
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleTaskClick(task)}
                              >
                                <h3 className="font-medium text-foreground">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                {hasIncompleteSprint(task.id) && (
                                  <span className="inline-block mt-2 text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded">
                                    Has stopped sprint
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-popover">
                                    <DropdownMenuItem
                                      onClick={() => onDeleteTask(task.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-muted-foreground">No tasks yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a task to start tracking your work
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Selection Dialog */}
      <Dialog open={showTimerSelect} onOpenChange={setShowTimerSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Sprint for "{selectedTask?.title}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {workBlocks.map(block => (
              <button
                key={block.id}
                onClick={() => handleSelectTimer(block)}
                className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-3"
              >
                <span className="text-2xl">{block.icon}</span>
                <div>
                  <p className="font-medium text-foreground">{block.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {block.workDuration}min work / {block.restDuration}min break
                    {block.cycles > 1 && ` × ${block.cycles} cycles`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
