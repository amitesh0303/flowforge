import { Workflow } from '@prisma/client';
import prisma from '../prisma';
import { wss } from '../websocket';
import axios from 'axios';
import { FlowNode, FlowEdge, topologicalSort } from './topologicalSort';

async function executeNode(
  node: FlowNode,
  inputData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (node.type) {
    case 'manualTrigger':
      return { triggered: true, timestamp: new Date().toISOString() };

    case 'webhook':
      return { ...inputData, webhookReceived: true };

    case 'httpRequest': {
      const { url, method = 'GET', headers = {}, body } = node.data as {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        body?: unknown;
      };
      if (!url) throw new Error('HTTP Request node missing URL');
      const response = await axios({ method, url, headers, data: body });
      return { status: response.status, data: response.data };
    }

    case 'ifElse': {
      const { condition } = node.data as { condition?: string };
      if (!condition) return { ...inputData, branch: 'true' };
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('data', `return !!(${condition})`);
        const result = fn(inputData) as boolean;
        return { ...inputData, branch: result ? 'true' : 'false' };
      } catch {
        return { ...inputData, branch: 'false' };
      }
    }

    case 'code': {
      const { script } = node.data as { script?: string };
      if (!script) return inputData;
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('data', script);
        const result = fn(inputData) as Record<string, unknown>;
        return result ?? inputData;
      } catch (err) {
        throw new Error(`Code node error: ${(err as Error).message}`);
      }
    }

    case 'delay': {
      const { ms = 1000 } = node.data as { ms?: number };
      await new Promise((resolve) => setTimeout(resolve, ms));
      return inputData;
    }

    case 'set': {
      const { fields = {} } = node.data as { fields?: Record<string, unknown> };
      return { ...inputData, ...fields };
    }

    case 'merge':
      return inputData;

    case 'schedule':
      return { triggered: true, timestamp: new Date().toISOString() };

    default:
      return inputData;
  }
}

export async function executeWorkflow(workflow: Workflow) {
  const nodes = (workflow.nodes as unknown as FlowNode[]) || [];
  const edges = (workflow.edges as unknown as FlowEdge[]) || [];

  const execution = await prisma.execution.create({
    data: { workflowId: workflow.id, status: 'running' },
  });

  wss.broadcast('execution:started', { executionId: execution.id, workflowId: workflow.id });

  const sortedNodes = topologicalSort(nodes, edges);
  const nodeResults: Record<string, Record<string, unknown>> = {};
  let currentData: Record<string, unknown> = {};

  try {
    for (const node of sortedNodes) {
      wss.broadcast('execution:nodeStarted', { executionId: execution.id, nodeId: node.id });
      const result = await executeNode(node, currentData);
      nodeResults[node.id] = result;
      currentData = result;
      wss.broadcast('execution:nodeCompleted', {
        executionId: execution.id,
        nodeId: node.id,
        result,
      });
    }

    const finished = await prisma.execution.update({
      where: { id: execution.id },
      data: { status: 'success', finishedAt: new Date(), nodeResults: nodeResults as object },
    });

    wss.broadcast('execution:completed', { executionId: execution.id, status: 'success' });
    return finished;
  } catch (error) {
    const errorMsg = (error as Error).message;
    const finished = await prisma.execution.update({
      where: { id: execution.id },
      data: { status: 'error', finishedAt: new Date(), error: errorMsg, nodeResults: nodeResults as object },
    });

    wss.broadcast('execution:completed', { executionId: execution.id, status: 'error', error: errorMsg });
    return finished;
  }
}
