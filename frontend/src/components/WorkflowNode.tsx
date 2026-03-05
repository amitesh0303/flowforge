'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NODE_TYPES } from '@/lib/nodeTypes';

function WorkflowNode({ data, selected }: NodeProps) {
  const nodeData = data as { label?: string; nodeType?: string; [key: string]: unknown };
  const config = NODE_TYPES[nodeData.nodeType as string];
  const color = config?.color || '#6b7280';

  return (
    <div
      className={`rounded-lg border-2 min-w-[160px] bg-gray-900 shadow-lg ${
        selected ? 'border-white' : 'border-gray-600'
      }`}
      style={{ borderColor: selected ? 'white' : color }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div
        className="px-3 py-2 rounded-t-md text-white text-sm font-medium"
        style={{ backgroundColor: color }}
      >
        {nodeData.label || config?.label || nodeData.nodeType || 'Node'}
      </div>
      <div className="px-3 py-2 text-xs text-gray-400">
        {config?.description || ''}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

export default memo(WorkflowNode);
