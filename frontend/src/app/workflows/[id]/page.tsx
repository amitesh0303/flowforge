'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api, Workflow, FlowNode, FlowEdge } from '@/lib/api';
import { NODE_TYPES as nodeTypeConfigs } from '@/lib/nodeTypes';
import WorkflowNode from '@/components/WorkflowNode';
import NodeSidebar from '@/components/NodeSidebar';
import ExecutionHistory from '@/components/ExecutionHistory';

const nodeTypes = { workflowNode: WorkflowNode };

function toRFNodes(nodes: FlowNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: 'workflowNode',
    position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
    data: { ...n.data, nodeType: n.type, label: n.data.label || nodeTypeConfigs[n.type]?.label || n.type },
  }));
}

function toRFEdges(edges: FlowEdge[]): Edge[] {
  return edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
}

function fromRFNodes(nodes: Node[]): FlowNode[] {
  return nodes.map((n) => ({
    id: n.id,
    type: (n.data.nodeType as string) || 'set',
    position: n.position,
    data: n.data as Record<string, unknown>,
  }));
}

function fromRFEdges(edges: Edge[]): FlowEdge[] {
  return edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function WorkflowEditorPage({ params }: Props) {
  const { id } = use(params);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    api.get<Workflow>(`/workflows/${id}`).then((res) => {
      setWorkflow(res.data);
      setNodes(toRFNodes(res.data.nodes));
      setEdges(toRFEdges(res.data.edges));
    });
  }, [id, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode({
        id: node.id,
        type: (node.data.nodeType as string) || 'set',
        position: node.position,
        data: node.data as Record<string, unknown>,
      });
    },
    []
  );

  const handleUpdateNode = useCallback(
    (updated: FlowNode) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === updated.id
            ? { ...n, data: { ...updated.data, nodeType: updated.type, label: updated.data.label || nodeTypeConfigs[updated.type]?.label || updated.type } }
            : n
        )
      );
      setSelectedNode(updated);
    },
    [setNodes]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      const config = nodeTypeConfigs[type];
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'workflowNode',
        position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
        data: { ...config.defaultData, nodeType: type, label: config.label },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = async () => {
    if (!workflow) return;
    setSaveStatus('Saving...');
    try {
      await api.put(`/workflows/${workflow.id}`, {
        name: workflow.name,
        description: workflow.description,
        nodes: fromRFNodes(nodes),
        edges: fromRFEdges(edges),
      });
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch {
      setSaveStatus('Save failed');
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;
    setExecuting(true);
    try {
      await handleSave();
      await api.post(`/workflows/${workflow.id}/execute`, {});
      setShowHistory(true);
    } catch {
      // ignore
    } finally {
      setExecuting(false);
    }
  };

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Link href="/workflows" className="text-gray-400 hover:text-white text-sm">
            ← Workflows
          </Link>
          <h1 className="text-white font-semibold">{workflow.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && <span className="text-xs text-gray-400">{saveStatus}</span>}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            History
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleExecute}
            disabled={executing}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            {executing ? 'Running...' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
          >
            <Background variant={BackgroundVariant.Dots} color="#374151" />
            <Controls className="!bg-gray-800 !border-gray-700 !text-white" />
            <MiniMap className="!bg-gray-900 !border-gray-700" />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        {showHistory ? (
          <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Execution History</h3>
            <ExecutionHistory workflowId={workflow.id} />
          </div>
        ) : (
          <NodeSidebar
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onAddNode={handleAddNode}
          />
        )}
      </div>
    </div>
  );
}
