import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-3">⚡ FlowForge</h1>
        <p className="text-xl text-gray-400">Visual Workflow Automation Platform</p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/workflows"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          View Workflows
        </Link>
        <Link
          href="/workflows/new"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Create Workflow
        </Link>
      </div>
    </main>
  );
}
