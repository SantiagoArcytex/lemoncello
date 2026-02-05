import { useState, useRef, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings2, Trash2, Clock, RotateCcw, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerBlock } from '@/types/blocks';
import { IconPicker } from './IconPicker';

interface DraggableBlockCardProps {
  block: TimerBlock;
  onStart: (block: TimerBlock) => void;
  onUpdate: (id: string, updates: Partial<TimerBlock>) => void;
  onDelete: (id: string) => void;
  index: number;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

function TaskIcon({ icon }: { icon?: string }) {
  const iconValue = icon || '🎯';
  const isImageUrl = iconValue.startsWith('data:') || iconValue.startsWith('http') || iconValue.startsWith('/');
  
  if (isImageUrl) {
    return (
      <img 
        src={iconValue} 
        alt="Task icon" 
        className="w-8 h-8 object-cover rounded-md"
      />
    );
  }
  return <span className="text-2xl">{iconValue}</span>;
}

export function DraggableBlockCard({
  block,
  onStart,
  onUpdate,
  onDelete,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isDragOver,
}: DraggableBlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: block.name,
    description: block.description || '',
    icon: block.icon || '🎯',
    workDuration: block.workDuration,
    restDuration: block.restDuration,
    cycles: block.cycles,
  });
  const dragRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onUpdate(block.id, {
      name: editValues.name,
      description: editValues.description,
      icon: editValues.icon,
      workDuration: editValues.workDuration,
      restDuration: editValues.restDuration,
      cycles: editValues.cycles,
    });
    setIsEditing(false);
  };

  const getBlockInfo = () => {
    if (block.type === 'meeting') {
      return `${block.workDuration} min`;
    }
    if (block.type === 'rest') {
      return `${block.restDuration} min rest`;
    }
    return `${block.workDuration}/${block.restDuration} × ${block.cycles}`;
  };

  const getTotalTime = () => {
    if (block.type === 'meeting') return block.workDuration;
    if (block.type === 'rest') return block.restDuration;
    return (block.workDuration + block.restDuration) * block.cycles - block.restDuration;
  };

  const handleDragStartEvent = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    onDragStart(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterEvent = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragEnter(index);
  };

  const handleDragEndEvent = () => {
    onDragEnd();
  };

  return (
    <div
      ref={dragRef}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnterEvent}
      className={isDragOver ? 'border-primary' : ''}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isDragging ? 0.5 : 1, 
          y: 0,
          scale: isDragOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
      <Card className={`group hover:border-primary/50 hover:glow-subtle transition-all duration-300 ${isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                draggable
                onDragStart={handleDragStartEvent}
                onDragEnd={handleDragEndEvent}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors touch-none"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <TaskIcon icon={block.icon} />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg">{block.name}</CardTitle>
                {block.description && (
                  <p className="text-sm text-muted-foreground truncate">{block.description}</p>
                )}
                <p className="text-xs text-muted-foreground">{getBlockInfo()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-20">Icon</label>
                <IconPicker 
                  value={editValues.icon} 
                  onChange={(icon) => setEditValues(v => ({ ...v, icon }))}
                  size="sm"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-20">Name</label>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                  className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Task name"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-20">Description</label>
                <input
                  type="text"
                  value={editValues.description}
                  onChange={(e) => setEditValues(v => ({ ...v, description: e.target.value }))}
                  className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Optional description"
                />
              </div>

              {block.type !== 'rest' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground w-20">Work</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={editValues.workDuration}
                    onChange={(e) => setEditValues(v => ({ ...v, workDuration: parseInt(e.target.value) || 1 }))}
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              )}
              
              {block.type !== 'meeting' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground w-20">Rest</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editValues.restDuration}
                    onChange={(e) => setEditValues(v => ({ ...v, restDuration: parseInt(e.target.value) || 1 }))}
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              )}
              
              {block.type === 'pomodoro' && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground w-20">Cycles</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editValues.cycles}
                    onChange={(e) => setEditValues(v => ({ ...v, cycles: parseInt(e.target.value) || 1 }))}
                    className="flex-1 h-9 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {getTotalTime()} min total
                </span>
                {block.type === 'pomodoro' && (
                  <span className="flex items-center gap-1">
                    <RotateCcw className="h-4 w-4" />
                    {block.cycles} cycles
                  </span>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => onStart(block)}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
