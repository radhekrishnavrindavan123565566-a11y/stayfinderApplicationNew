"use client";
import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock, Activity, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface QueueStats {
  name: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export default function QueuesPage() {
  const { ready, user } = useRequireAuth(['admin']);
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQueueStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/queues');
      setQueues(data.data.queues);
    } catch (error) {
      console.error('Failed to fetch queue stats:', error);
      toast.error('Failed to load queue statistics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQueueStats();
  };

  const handleRetryFailed = async (queueName: string) => {
    try {
      const { data } = await axios.post('/api/admin/queues', {
        queueName: queueName.toLowerCase(),
      });
      toast.success(data.data.message);
      await fetchQueueStats();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to retry jobs');
      }
    }
  };

  useEffect(() => {
    if (ready && user) {
      fetchQueueStats();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchQueueStats, 10000);
      return () => clearInterval(interval);
    }
  }, [ready, user]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-rose-500 mb-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Queue Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Monitor and manage background job queues
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="secondary"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Queue Stats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queues.map((queue) => (
              <div
                key={queue.name}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 p-6"
              >
                {/* Queue Name */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {queue.name}
                  </h3>
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Waiting</span>
                    </div>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {queue.waiting}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Active</span>
                    </div>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {queue.active}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed</span>
                    </div>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {queue.completed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Failed</span>
                    </div>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {queue.failed}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Delayed</span>
                    </div>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {queue.delayed}
                    </span>
                  </div>
                </div>

                {/* Retry Button */}
                {queue.failed > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                      onClick={() => handleRetryFailed(queue.name)}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry {queue.failed} Failed Jobs
                    </Button>
                  </div>
                )}

                {/* Health Indicator */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Health</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          queue.failed > 10
                            ? 'bg-red-500'
                            : queue.waiting > 100
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {queue.failed > 10
                          ? 'Critical'
                          : queue.waiting > 100
                          ? 'Warning'
                          : 'Healthy'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Queue Workers
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Make sure the worker process is running: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">npm run workers</code>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Stats auto-refresh every 10 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
