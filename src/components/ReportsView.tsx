import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Clock, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TimerSession } from '@/types/blocks';

interface ReportsViewProps {
  sessions: TimerSession[];
  onClearSessions: () => void;
}

function formatDate(date: Date | string): string {
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

export function ReportsView({ sessions, onClearSessions }: ReportsViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const groupedSessions = useMemo(() => {
    const groups: Record<string, TimerSession[]> = {};
    sessions.forEach((session) => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }
      groups[session.date].push(session);
    });
    return groups;
  }, [sessions]);

  const dates = useMemo(() => {
    return Object.keys(groupedSessions).sort((a, b) => b.localeCompare(a));
  }, [groupedSessions]);

  const filteredSessions = useMemo(() => {
    return groupedSessions[selectedDate] || [];
  }, [groupedSessions, selectedDate]);

  const totalWorkMinutes = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + s.totalWorkMinutes, 0);
  }, [filteredSessions]);

  const exportToCSV = () => {
    const headers = ['Date', 'Block Name', 'Start Time', 'End Time', 'Total Work Minutes', 'Work Description'];
    const rows = sessions.map((s) => [
      s.date,
      s.blockName,
      new Date(s.startTime).toISOString(),
      s.endTime ? new Date(s.endTime).toISOString() : '',
      s.totalWorkMinutes.toString(),
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
                {formatDate(date)}
              </button>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {filteredSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Focus Time</p>
                    <p className="text-3xl font-bold text-primary">
                      {Math.floor(totalWorkMinutes / 60)}h {totalWorkMinutes % 60}m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sessions</p>
                    <p className="text-3xl font-bold text-foreground">
                      {filteredSessions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-3">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{session.blockName}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatTime(session.startTime)}
                          </span>
                          {session.endTime && (
                            <span>→ {formatTime(session.endTime)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          {session.totalWorkMinutes}
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">min</span>
                      </div>
                    </div>
                    {session.workDescription && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {session.workDescription}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
