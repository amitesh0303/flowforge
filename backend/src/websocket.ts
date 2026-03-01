import { WebSocket } from 'ws';

class WebSocketService {
  private clients: Set<WebSocket> = new Set();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
  }

  removeClient(ws: WebSocket): void {
    this.clients.delete(ws);
  }

  broadcast(event: string, data: unknown): void {
    const message = JSON.stringify({ event, data });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export const wss = new WebSocketService();
