'use client';

import { NODE_TYPES, NODE_TYPE_LIST } from '@/lib/nodeTypes';
import { FlowNode } from '@/lib/api';

interface Props {
  selectedNode: FlowNode | null;
  onUpdateNode: (node: FlowNode) => void;
  onAddNode: (type: string) => void;
}

export default function NodeSidebar({ selectedNode, onUpdateNode, onAddNode }: Props) {
  if (selectedNode) {
    const config = NODE_TYPES[selectedNode.type];

    return (
      <div className="w-72 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        <h3 className="text-white font-semibold mb-4">
          {config?.label || selectedNode.type}
        </h3>
        <div className="space-y-3">
          {Object.entries(selectedNode.data).map(([key, value]) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1 capitalize">
                {key}
              </label>
              <input
                type="text"
                value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                onChange={(e) => {
                  let parsed: unknown = e.target.value;
                  const v = e.target.value.trim();
                  if (v.startsWith('{') || v.startsWith('[')) {
                    try { parsed = JSON.parse(v); } catch { /* keep as string */ }
                  }
                  onUpdateNode({
                    ...selectedNode,
                    data: { ...selectedNode.data, [key]: parsed },
                  });
                }}
                className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 border border-gray-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-white font-semibold mb-4">Add Node</h3>
      <div className="space-y-2">
        {NODE_TYPE_LIST.map((nodeType) => (
          <button
            key={nodeType.type}
            onClick={() => onAddNode(nodeType.type)}
            className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <div
              className="text-sm font-medium"
              style={{ color: nodeType.color }}
            >
              {nodeType.label}
            </div>
            <div className="text-xs text-gray-500">{nodeType.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
