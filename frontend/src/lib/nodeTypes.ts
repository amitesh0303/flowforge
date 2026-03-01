export interface NodeTypeConfig {
  label: string;
  description: string;
  color: string;
  defaultData: Record<string, unknown>;
}

export const NODE_TYPES: Record<string, NodeTypeConfig> = {
  manualTrigger: {
    label: 'Manual Trigger',
    description: 'Start workflow manually',
    color: '#6366f1',
    defaultData: {},
  },
  webhook: {
    label: 'Webhook',
    description: 'Receive HTTP requests',
    color: '#8b5cf6',
    defaultData: { path: '/webhook', method: 'POST' },
  },
  schedule: {
    label: 'Schedule',
    description: 'Trigger on a schedule',
    color: '#0ea5e9',
    defaultData: { cron: '0 * * * *' },
  },
  httpRequest: {
    label: 'HTTP Request',
    description: 'Make HTTP API calls',
    color: '#f59e0b',
    defaultData: { url: '', method: 'GET', headers: {}, body: '' },
  },
  ifElse: {
    label: 'IF/Else',
    description: 'Conditional branching',
    color: '#ef4444',
    defaultData: { condition: 'data.status === 200' },
  },
  code: {
    label: 'Code',
    description: 'Run custom JavaScript',
    color: '#10b981',
    defaultData: { script: 'return data;' },
  },
  delay: {
    label: 'Delay',
    description: 'Wait for a duration',
    color: '#f97316',
    defaultData: { ms: 1000 },
  },
  set: {
    label: 'Set',
    description: 'Set variables',
    color: '#14b8a6',
    defaultData: { fields: {} },
  },
  merge: {
    label: 'Merge',
    description: 'Merge data streams',
    color: '#a855f7',
    defaultData: {},
  },
};

export const NODE_TYPE_LIST = Object.entries(NODE_TYPES).map(([type, config]) => ({
  type,
  ...config,
}));
