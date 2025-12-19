import { motion } from 'framer-motion';
import { Timer, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'timer' | 'reports';
  onTabChange: (tab: 'timer' | 'reports') => void;
  isTimerActive: boolean;
}

export function BottomNav({ activeTab, onTabChange, isTimerActive }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => onTabChange('timer')}
            className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              activeTab === 'timer'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="relative">
              <Timer className="h-6 w-6" />
              {isTimerActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                />
              )}
            </div>
            <span className="text-xs font-medium">Timer</span>
            {activeTab === 'timer' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
              />
            )}
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs font-medium">Reports</span>
            {activeTab === 'reports' && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
              />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
