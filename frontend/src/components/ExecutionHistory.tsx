'use client';

import { useEffect, useState } from 'react';
import { api, Execution } from '@/lib/api';

interface Props {
  workflowId: string;
}

export default function ExecutionHistory({ workflowId }: Props) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Execution[]>(`/executions/workflow/${workflowId}`)
      .then((res) => setExecutions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [workflowId]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'running': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) return <div className="text-gray-400 text-sm p-4">Loading...</div>;

  return (
    <div className="space-y-2">
      {executions.length === 0 ? (
        <p className="text-gray-500 text-sm">No executions yet.</p>
      ) : (
        executions.map((exec) => (
          <div key={exec.id} className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${statusColor(exec.status)}`}>
                {exec.status}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(exec.startedAt).toLocaleString()}
              </span>
            </div>
            {exec.error && (
              <p className="text-xs text-red-400 mt-1">{exec.error}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
