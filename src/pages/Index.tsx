import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BlockLibrary } from '@/components/BlockLibrary';
import { ActiveTimer } from '@/components/ActiveTimer';
import { ActiveCall } from '@/components/ActiveCall';
import { ReportsView } from '@/components/ReportsView';
import { BottomNav } from '@/components/BottomNav';
import { PhaseTransitionModal } from '@/components/PhaseTransitionModal';
import { StopConfirmationModal } from '@/components/StopConfirmationModal';
import { CancelConfirmationModal } from '@/components/CancelConfirmationModal';
import { useBlocks } from '@/hooks/useBlocks';
import { useTimer } from '@/hooks/useTimer';
import { useTasks } from '@/hooks/useTasks';
import { useBackgroundNotification } from '@/hooks/useBackgroundNotification';
import { TimerSession } from '@/types/blocks';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'reports'>('timer');
  const [showStopModal, setShowStopModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [callState, setCallState] = useState<{ isActive: boolean; startTime: Date | null }>({
    isActive: false,
    startTime: null,
  });
  
  const { blocks, addBlock, updateBlock, deleteBlock, reorderBlocks } = useBlocks();
  const {
    timerState,
    sessions,
    pendingTransition,
    startBlock,
    startQuickStart,
    pauseTimer,
    resumeTimer,
    stopTimerWithDescription,
    cancelTimer,
    confirmTransition,
    updateWorkDescription,
    getElapsedTime,
    getTodaySessions,
    hasIncompleteSprint,
    clearSessions,
    addSession,
  } = useTimer();
  
  const {
    tasks,
    addTask,
    completeTask,
    uncompleteTask,
    deleteTask,
  } = useTasks();

  // Background notification hook
  useBackgroundNotification({
    isRunning: timerState.isRunning || callState.isActive,
    timeRemaining: timerState.timeRemaining,
    blockName: callState.isActive ? 'Call in Progress' : (timerState.currentBlock?.name || ''),
    isWorkPhase: timerState.isWorkPhase,
  });

  const todayMinutes = useMemo(() => {
    return getTodaySessions().reduce((sum, s) => sum + s.totalWorkMinutes, 0);
  }, [getTodaySessions]);

  const isTimerActive = timerState.isRunning || timerState.isPaused;

  const handleStopRequest = () => {
    setShowStopModal(true);
  };

  const handleCancelRequest = () => {
    setShowCancelModal(true);
  };

  const handleStopConfirm = (description: string) => {
    stopTimerWithDescription(description);
    setShowStopModal(false);
  };

  const handleCancelConfirm = () => {
    cancelTimer();
    setShowCancelModal(false);
  };

  // Call tracking handlers
  const handleStartCall = () => {
    setCallState({ isActive: true, startTime: new Date() });
  };

  const handleStopCall = (description: string) => {
    if (!callState.startTime) return;
    
    const now = new Date();
    const elapsedMs = now.getTime() - callState.startTime.getTime();
    const totalMinutes = Math.floor(elapsedMs / 60000);
    
    const callSession: Omit<TimerSession, 'id'> = {
      blockId: 'call-tracker',
      blockName: 'Call',
      startTime: callState.startTime,
      endTime: now,
      totalWorkMinutes: totalMinutes,
      workDescription: description,
      completed: true,
      stoppedByUser: false,
      date: now.toISOString().split('T')[0],
    };
    
    addSession(callSession);
    setCallState({ isActive: false, startTime: null });
  };

  const handleCancelCall = () => {
    setCallState({ isActive: false, startTime: null });
  };

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
            callState.isActive && callState.startTime ? (
              <motion.div
                key="active-call"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ActiveCall
                  startTime={callState.startTime}
                  onStop={handleStopCall}
                  onCancel={handleCancelCall}
                />
              </motion.div>
            ) : isTimerActive ? (
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
                  onStop={handleStopRequest}
                  onCancel={handleCancelRequest}
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
                  onQuickStart={startQuickStart}
                  onStartCall={handleStartCall}
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

        {/* Phase Transition Modal */}
        <PhaseTransitionModal
          isOpen={pendingTransition !== null}
          transitionType={pendingTransition}
          breakDuration={timerState.currentBlock?.restDuration || 5}
          currentCycle={timerState.currentCycle + 1}
          totalCycles={timerState.currentBlock?.cycles || 1}
          onConfirm={confirmTransition}
        />

        {/* Stop Confirmation Modal */}
        <StopConfirmationModal
          isOpen={showStopModal}
          onClose={() => setShowStopModal(false)}
          onConfirm={handleStopConfirm}
          blockName={timerState.currentBlock?.name || ''}
          elapsedTime={getElapsedTime()}
          currentDescription={timerState.workDescription}
        />

        {/* Cancel Confirmation Modal */}
        <CancelConfirmationModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          blockName={timerState.currentBlock?.name || ''}
        />
      </main>
    </>
  );
};

export default Index;
