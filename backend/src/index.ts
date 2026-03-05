import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';
import { wss } from './websocket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);

new WebSocketServer({ server }).on('connection', (socket) => {
  wss.addClient(socket);
  socket.on('close', () => wss.removeClient(socket));
});

server.listen(PORT, () => {
  console.log(`FlowForge backend running on port ${PORT}`);
});

export default app;
