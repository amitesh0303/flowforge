import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { executeWorkflow } from '../engine/executor';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const workflows = await prisma.workflow.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const workflow = await prisma.workflow.findUnique({ where: { id } });
    if (!workflow) { res.status(404).json({ error: 'Workflow not found' }); return; }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, nodes, edges } = req.body;
    if (!name) { res.status(400).json({ error: 'Name is required' }); return; }
    const workflow = await prisma.workflow.create({
      data: { name, description, nodes: nodes || [], edges: edges || [] },
    });
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { name, description, nodes, edges, active } = req.body;
    const workflow = await prisma.workflow.update({
      where: { id },
      data: { name, description, nodes, edges, active },
    });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    await prisma.workflow.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const workflow = await prisma.workflow.findUnique({ where: { id } });
    if (!workflow) { res.status(404).json({ error: 'Workflow not found' }); return; }
    const execution = await executeWorkflow(workflow);
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

export default router;
