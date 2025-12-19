import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Settings2, Trash2, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimerBlock } from '@/types/blocks';

interface BlockCardProps {
  block: TimerBlock;
  onStart: (block: TimerBlock) => void;
  onUpdate: (id: string, updates: Partial<TimerBlock>) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function BlockCard({ block, onStart, onUpdate, onDelete, index }: BlockCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    workDuration: block.workDuration,
    restDuration: block.restDuration,
    cycles: block.cycles,
  });

  const handleSave = () => {
    onUpdate(block.id, editValues);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:border-primary/50 hover:glow-subtle transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{block.icon}</span>
              <div>
                <CardTitle className="text-lg">{block.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{getBlockInfo()}</p>
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
  );
}
