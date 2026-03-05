import { topologicalSort } from '../engine/topologicalSort';

describe('topologicalSort', () => {
  it('returns nodes in topological order for a linear chain', () => {
    const nodes = [
      { id: 'a', type: 'manualTrigger', data: {} },
      { id: 'b', type: 'httpRequest', data: {} },
      { id: 'c', type: 'set', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c' },
    ];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('handles a single node with no edges', () => {
    const nodes = [{ id: 'a', type: 'manualTrigger', data: {} }];
    const sorted = topologicalSort(nodes, []);
    expect(sorted.map((n) => n.id)).toEqual(['a']);
  });

  it('handles an empty graph', () => {
    const sorted = topologicalSort([], []);
    expect(sorted).toEqual([]);
  });

  it('handles branching (ifElse node)', () => {
    const nodes = [
      { id: 'trigger', type: 'manualTrigger', data: {} },
      { id: 'ifelse', type: 'ifElse', data: {} },
      { id: 'branchA', type: 'set', data: {} },
      { id: 'branchB', type: 'set', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'trigger', target: 'ifelse' },
      { id: 'e2', source: 'ifelse', target: 'branchA' },
      { id: 'e3', source: 'ifelse', target: 'branchB' },
    ];
    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);
    expect(ids.indexOf('trigger')).toBeLessThan(ids.indexOf('ifelse'));
    expect(ids.indexOf('ifelse')).toBeLessThan(ids.indexOf('branchA'));
    expect(ids.indexOf('ifelse')).toBeLessThan(ids.indexOf('branchB'));
  });

  it('handles merge node (multiple inputs)', () => {
    const nodes = [
      { id: 'a', type: 'manualTrigger', data: {} },
      { id: 'b', type: 'httpRequest', data: {} },
      { id: 'merge', type: 'merge', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'a', target: 'merge' },
      { id: 'e2', source: 'b', target: 'merge' },
    ];
    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);
    expect(ids.indexOf('a')).toBeLessThan(ids.indexOf('merge'));
    expect(ids.indexOf('b')).toBeLessThan(ids.indexOf('merge'));
  });

  it('returns empty array for a cycle (cycle detection)', () => {
    const nodes = [
      { id: 'a', type: 'set', data: {} },
      { id: 'b', type: 'set', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'a' },
    ];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted).toHaveLength(0);
  });

  it('handles diamond graph correctly', () => {
    const nodes = [
      { id: 'root', type: 'manualTrigger', data: {} },
      { id: 'left', type: 'httpRequest', data: {} },
      { id: 'right', type: 'httpRequest', data: {} },
      { id: 'merge', type: 'merge', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'root', target: 'left' },
      { id: 'e2', source: 'root', target: 'right' },
      { id: 'e3', source: 'left', target: 'merge' },
      { id: 'e4', source: 'right', target: 'merge' },
    ];
    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);
    expect(ids[0]).toBe('root');
    expect(ids[3]).toBe('merge');
    expect(ids).toHaveLength(4);
  });

  it('handles multiple trigger nodes', () => {
    const nodes = [
      { id: 't1', type: 'manualTrigger', data: {} },
      { id: 't2', type: 'schedule', data: {} },
      { id: 'action', type: 'set', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 't1', target: 'action' },
      { id: 'e2', source: 't2', target: 'action' },
    ];
    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);
    expect(ids.indexOf('action')).toBeGreaterThan(ids.indexOf('t1'));
    expect(ids.indexOf('action')).toBeGreaterThan(ids.indexOf('t2'));
  });

  it('handles 5 node chain', () => {
    const nodes = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      type: 'set',
      data: {},
    }));
    const edges = Array.from({ length: 4 }, (_, i) => ({
      id: `e${i}`,
      source: String(i),
      target: String(i + 1),
    }));
    const sorted = topologicalSort(nodes, edges);
    expect(sorted.map((n) => n.id)).toEqual(['0', '1', '2', '3', '4']);
  });

  it('handles parallel chains', () => {
    const nodes = [
      { id: 'a1', type: 'manualTrigger', data: {} },
      { id: 'a2', type: 'set', data: {} },
      { id: 'b1', type: 'schedule', data: {} },
      { id: 'b2', type: 'set', data: {} },
    ];
    const edges = [
      { id: 'e1', source: 'a1', target: 'a2' },
      { id: 'e2', source: 'b1', target: 'b2' },
    ];
    const sorted = topologicalSort(nodes, edges);
    const ids = sorted.map((n) => n.id);
    expect(ids.indexOf('a1')).toBeLessThan(ids.indexOf('a2'));
    expect(ids.indexOf('b1')).toBeLessThan(ids.indexOf('b2'));
  });

  it('handles delay and code nodes', () => {
    const nodes = [
      { id: 'trigger', type: 'manualTrigger', data: {} },
      { id: 'delay', type: 'delay', data: { ms: 500 } },
      { id: 'code', type: 'code', data: { script: 'return data;' } },
    ];
    const edges = [
      { id: 'e1', source: 'trigger', target: 'delay' },
      { id: 'e2', source: 'delay', target: 'code' },
    ];
    const sorted = topologicalSort(nodes, edges);
    expect(sorted.map((n) => n.id)).toEqual(['trigger', 'delay', 'code']);
  });
});
