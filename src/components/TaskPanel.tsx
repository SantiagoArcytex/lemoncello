import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, Play, MoreVertical, Trash2, ChevronLeft, Archive, RotateCcw } from 'lucide-react';
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
  onUncompleteTask: (id: string) => void;
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
  onUncompleteTask,
  onStartSprint,
  blocks,
  hasIncompleteSprint,
}: TaskPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTimerSelect, setShowTimerSelect] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const workBlocks = blocks.filter(b => b.type === 'pomodoro');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.isCompleted) return;
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-40 bg-background flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-bold text-foreground flex-1">
                {showCompleted ? 'Completed Tasks' : 'Tasks'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="gap-2"
              >
                {showCompleted ? (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Active
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Completed ({completedTasks.length})
                  </>
                )}
              </Button>
            </div>

            {/* Add Task Form - only show on active tasks view */}
            {!showCompleted && (
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
            )}

            {/* Task List */}
            <div className="flex-1 p-4 overflow-y-auto">
              {showCompleted ? (
                completedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {completedTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="opacity-70">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => onUncompleteTask(task.id)}
                                className="mt-1 text-primary"
                              >
                                <CheckCircle2 className="h-5 w-5 fill-primary" />
                              </button>
                              <div className="flex-1">
                                <h3 className="font-medium text-foreground line-through">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                {task.completedAt && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Completed {new Date(task.completedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
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
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-muted-foreground">No completed tasks yet</p>
                  </div>
                )
              ) : activeTasks.length > 0 ? (
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
