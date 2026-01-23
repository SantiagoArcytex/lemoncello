import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BlockLibrary } from '@/components/BlockLibrary';
import { ActiveTimer } from '@/components/ActiveTimer';
import { ReportsView } from '@/components/ReportsView';
import { BottomNav } from '@/components/BottomNav';
import { useBlocks } from '@/hooks/useBlocks';
import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'reports'>('timer');
  
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = useBlocks();
  const {
    timerState,
    sessions,
    startBlock,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateWorkDescription,
    getTodaySessions,
    hasIncompleteSprint,
    clearSessions,
  } = useTimer();
  
  const {
    tasks,
    addTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  } = useTasks();

  const todayMinutes = useMemo(() => {
    return getTodaySessions().reduce((sum, s) => sum + s.totalWorkMinutes, 0);
  }, [getTodaySessions]);

  const isTimerActive = timerState.isRunning || timerState.isPaused;

  return (
    <>
      <Helmet>
        <title>Lemoncello - Productivity Timer</title>
        <meta name="description" content="Boost your productivity with modular Pomodoro blocks, meeting timers, and detailed session reports." />
        <meta name="theme-color" content="#000000" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' ? (
            isTimerActive ? (
              <motion.div
                key="active-timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ActiveTimer
                  timerState={timerState}
                  onPause={pauseTimer}
                  onResume={resumeTimer}
                  onStop={stopTimer}
                  onUpdateDescription={updateWorkDescription}
                />
              </motion.div>
            ) : (
              <motion.div
                key="block-library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BlockLibrary
                  blocks={blocks}
                  onStartBlock={startBlock}
                  onUpdateBlock={updateBlock}
                  onDeleteBlock={deleteBlock}
                  onCreateBlock={addBlock}
                  onReorderBlocks={reorderBlocks}
                  todayMinutes={todayMinutes}
                  tasks={tasks}
                  onAddTask={addTask}
                  onCompleteTask={completeTask}
                  onUncompleteTask={uncompleteTask}
                  onDeleteTask={deleteTask}
                  hasIncompleteSprint={hasIncompleteSprint}
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReportsView sessions={sessions} tasks={tasks} onClearSessions={clearSessions} />
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isTimerActive={isTimerActive}
        />
      </main>
    </>
  );
};

export default Index;
