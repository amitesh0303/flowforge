'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Workflow } from '@/lib/api';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Workflow[]>('/workflows')
      .then((res) => setWorkflows(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    await api.delete(`/workflows/${id}`);
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Workflows</h1>
          <Link
            href="/workflows/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            + New Workflow
          </Link>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No workflows yet.</p>
            <Link href="/workflows/new" className="text-indigo-400 hover:underline mt-2 block">
              Create your first workflow
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-gray-900 rounded-xl border border-gray-700 p-5 flex items-center justify-between hover:border-gray-500 transition-colors"
              >
                <div>
                  <h2 className="text-white font-semibold text-lg">{workflow.name}</h2>
                  {workflow.description && (
                    <p className="text-gray-400 text-sm mt-1">{workflow.description}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white text-sm rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
