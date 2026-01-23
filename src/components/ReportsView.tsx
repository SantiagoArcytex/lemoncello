import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, FileText, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimerSession, Task } from '@/types/blocks';

interface ReportsViewProps {
  sessions: TimerSession[];
  tasks: Task[];
  onClearSessions: () => void;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

interface TaskReport {
  taskId: string;
  taskName: string;
  timerTypes: Set<string>;
  completedSprints: number;
  stoppedSprints: number;
  stoppedDetails: { blockName: string; timeCompleted: number; expected: number }[];
  totalMinutes: number;
}

interface DayReport {
  date: string;
  tasks: TaskReport[];
  tasklessSprints: {
    timerTypes: Set<string>;
    completedCount: number;
    stoppedCount: number;
    stoppedDetails: { blockName: string; timeCompleted: number; expected: number }[];
    totalMinutes: number;
  };
  totalMinutes: number;
}

export function ReportsView({ sessions, tasks, onClearSessions }: ReportsViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const dayReports = useMemo(() => {
    const reports: Record<string, DayReport> = {};

    sessions.forEach((session) => {
      if (!reports[session.date]) {
        reports[session.date] = {
          date: session.date,
          tasks: [],
          tasklessSprints: {
            timerTypes: new Set(),
            completedCount: 0,
            stoppedCount: 0,
            stoppedDetails: [],
            totalMinutes: 0,
          },
          totalMinutes: 0,
        };
      }

      const dayReport = reports[session.date];
      dayReport.totalMinutes += session.totalWorkMinutes;

      if (session.taskId && session.taskName) {
        let taskReport = dayReport.tasks.find(t => t.taskId === session.taskId);
        if (!taskReport) {
          taskReport = {
            taskId: session.taskId,
            taskName: session.taskName,
            timerTypes: new Set(),
            completedSprints: 0,
            stoppedSprints: 0,
            stoppedDetails: [],
            totalMinutes: 0,
          };
          dayReport.tasks.push(taskReport);
        }

        taskReport.timerTypes.add(session.blockName);
        taskReport.totalMinutes += session.totalWorkMinutes;

        if (session.stoppedByUser) {
          taskReport.stoppedSprints++;
          taskReport.stoppedDetails.push({
            blockName: session.blockName,
            timeCompleted: session.timeCompletedBeforeStopping || 0,
            expected: session.expectedDuration || 0,
          });
        } else {
          taskReport.completedSprints++;
        }
      } else {
        const taskless = dayReport.tasklessSprints;
        taskless.timerTypes.add(session.blockName);
        taskless.totalMinutes += session.totalWorkMinutes;

        if (session.stoppedByUser) {
          taskless.stoppedCount++;
          taskless.stoppedDetails.push({
            blockName: session.blockName,
            timeCompleted: session.timeCompletedBeforeStopping || 0,
            expected: session.expectedDuration || 0,
          });
        } else {
          taskless.completedCount++;
        }
      }
    });

    return reports;
  }, [sessions]);

  const dates = useMemo(() => {
    return Object.keys(dayReports).sort((a, b) => b.localeCompare(a));
  }, [dayReports]);

  const currentDayReport = useMemo(() => {
    return dayReports[selectedDate];
  }, [dayReports, selectedDate]);

  const exportToCSV = () => {
    const headers = ['Date', 'Task', 'Block Name', 'Start Time', 'End Time', 'Status', 'Time Worked (min)', 'Expected (min)', 'Description'];
    const rows = sessions.map((s) => [
      s.date,
      s.taskName || 'No task',
      s.blockName,
      new Date(s.startTime).toISOString(),
      s.endTime ? new Date(s.endTime).toISOString() : '',
      s.stoppedByUser ? 'Stopped by user' : 'Completed',
      s.totalWorkMinutes.toString(),
      (s.expectedDuration || '').toString(),
      `"${s.workDescription.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lemoncello-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen px-4 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Track your productivity</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSessions}
              disabled={sessions.length === 0}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={exportToCSV}
              disabled={sessions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Date Selector */}
        {dates.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDate === date
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {formatShortDate(date)}
              </button>
            ))}
          </div>
        )}

        {/* Day Report */}
        {currentDayReport ? (
          <div className="space-y-6">
            {/* Date Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {formatDate(selectedDate)}
              </h2>
            </div>

            {/* Daily Total Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Total</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatMinutes(currentDayReport.totalMinutes)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Tasks Worked</p>
                    <p className="text-3xl font-bold text-foreground">
                      {currentDayReport.tasks.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            {currentDayReport.tasks.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tasks
                </h3>
                <div className="space-y-3">
                  {currentDayReport.tasks.map((taskReport, index) => (
                    <motion.div
                      key={taskReport.taskId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-foreground">
                              {taskReport.taskName}
                            </h4>
                            <span className="text-lg font-bold text-primary">
                              {formatMinutes(taskReport.totalMinutes)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {Array.from(taskReport.timerTypes).map(type => (
                              <span
                                key={type}
                                className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {taskReport.completedSprints > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {taskReport.completedSprints} completed
                              </span>
                            )}
                            {taskReport.stoppedSprints > 0 && (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                {taskReport.stoppedSprints} stopped
                              </span>
                            )}
                          </div>

                          {taskReport.stoppedDetails.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-2">Stopped sprints:</p>
                              {taskReport.stoppedDetails.map((detail, i) => (
                                <p key={i} className="text-xs text-muted-foreground">
                                  • {detail.blockName}: {detail.timeCompleted}min of {detail.expected}min
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Taskless Sprints Section */}
            {(currentDayReport.tasklessSprints.completedCount > 0 || 
              currentDayReport.tasklessSprints.stoppedCount > 0) && (
              <div>
                <h3 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Sprints Without Task
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(currentDayReport.tasklessSprints.timerTypes).map(type => (
                          <span
                            key={type}
                            className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {formatMinutes(currentDayReport.tasklessSprints.totalMinutes)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {currentDayReport.tasklessSprints.completedCount > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {currentDayReport.tasklessSprints.completedCount} completed
                        </span>
                      )}
                      {currentDayReport.tasklessSprints.stoppedCount > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          {currentDayReport.tasklessSprints.stoppedCount} stopped
                        </span>
                      )}
                    </div>

                    {currentDayReport.tasklessSprints.stoppedDetails.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Stopped sprints:</p>
                        {currentDayReport.tasklessSprints.stoppedDetails.map((detail, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            • {detail.blockName}: {detail.timeCompleted}min of {detail.expected}min
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions yet</h3>
            <p className="text-muted-foreground">
              Complete a timer block to see your report
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}