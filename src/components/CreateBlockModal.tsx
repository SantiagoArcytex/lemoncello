import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockType, TimerBlock } from '@/types/blocks';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlock: (block: Omit<TimerBlock, 'id' | 'createdAt'>) => void;
}

const ICONS = ['🎯', '🧠', '📞', '☕', '💻', '✏️', '📚', '🎨', '🏃', '🧘'];

const BLOCK_TYPES: { value: BlockType; label: string; description: string }[] = [
  { value: 'pomodoro', label: 'Pomodoro', description: 'Work/rest cycles' },
  { value: 'meeting', label: 'Meeting', description: 'Single countdown' },
  { value: 'rest', label: 'Rest', description: 'Break time only' },
];

export function CreateBlockModal({ isOpen, onClose, onCreateBlock }: CreateBlockModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<BlockType>('pomodoro');
  const [icon, setIcon] = useState('🎯');
  const [workDuration, setWorkDuration] = useState(25);
  const [restDuration, setRestDuration] = useState(5);
  const [cycles, setCycles] = useState(4);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    onCreateBlock({
      name: name.trim(),
      type,
      icon,
      workDuration: type === 'rest' ? 0 : workDuration,
      restDuration: type === 'meeting' ? 0 : restDuration,
      cycles: type === 'pomodoro' ? cycles : 1,
    });
    
    // Reset form
    setName('');
    setType('pomodoro');
    setIcon('🎯');
    setWorkDuration(25);
    setRestDuration(5);
    setCycles(4);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Block</CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Block Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Focus"
                    className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        onClick={() => setIcon(i)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                          icon === i
                            ? 'bg-primary text-primary-foreground scale-110'
                            : 'bg-secondary hover:bg-muted'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Block Type */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BLOCK_TYPES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setType(t.value)}
                        className={`p-3 rounded-lg text-center transition-all ${
                          type === t.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className={`text-xs mt-0.5 ${type === t.value ? 'opacity-80' : 'text-muted-foreground'}`}>
                          {t.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Settings */}
                <div className="space-y-3">
                  {type !== 'rest' && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground w-20">Work</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={workDuration}
                        onChange={(e) => setWorkDuration(parseInt(e.target.value) || 1)}
                        className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  )}
                  
                  {type !== 'meeting' && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground w-20">Rest</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={restDuration}
                        onChange={(e) => setRestDuration(parseInt(e.target.value) || 1)}
                        className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">min</span>
                    </div>
                  )}
                  
                  {type === 'pomodoro' && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-muted-foreground w-20">Cycles</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={cycles}
                        onChange={(e) => setCycles(parseInt(e.target.value) || 1)}
                        className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">×</span>
                    </div>
                  )}
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Block
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
