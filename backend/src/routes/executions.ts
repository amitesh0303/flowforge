import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const executions = await prisma.execution.findMany({
      orderBy: { startedAt: 'desc' },
      include: { workflow: { select: { name: true } } },
    });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

router.get('/workflow/:workflowId', async (req: Request, res: Response) => {
  try {
    const workflowId = req.params['workflowId'] as string;
    const executions = await prisma.execution.findMany({
      where: { workflowId },
      orderBy: { startedAt: 'desc' },
    });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const execution = await prisma.execution.findUnique({ where: { id } });
    if (!execution) { res.status(404).json({ error: 'Execution not found' }); return; }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

export default router;
