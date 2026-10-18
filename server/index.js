import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Inicjalizacja serwera WebSocket podłączonego do serwera HTTP
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 8080;

// Serwowanie statycznych plików wygenerowanych przez Vite
app.use(express.static(path.join(__dirname, '../dist')));

// Wszystkie pozostałe zapytania kierujemy do index.html (obsługa routingu React, jeśli istnieje)
// W Express 5.x składnia z '*' w metodzie get() może powodować błąd (PathError). Zamiast tego stosujemy catch-all middleware.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Pamięć pokoi
const rooms = {};

// Logika serwera Multiplayer
wss.on('connection', (ws) => {
  console.log('New client connected!');
  ws.roomId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'create_room') {
        const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[roomId] = {
          clients: [ws],
          state: { elements: [], icons: [], mapId: null }
        };
        ws.roomId = roomId;
        ws.send(JSON.stringify({ type: 'room_created', roomId }));
        console.log(`Room created: ${roomId}`);
      }

      else if (data.type === 'join_room') {
        const roomId = data.roomId.toUpperCase();
        if (rooms[roomId]) {
          rooms[roomId].clients.push(ws);
          ws.roomId = roomId;
          ws.send(JSON.stringify({ type: 'room_joined', roomId, state: rooms[roomId].state }));
          console.log(`Client joined room: ${roomId}`);
        } else {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        }
      }

      else if (data.type === 'leave_room') {
        handleLeaveRoom(ws);
      }

      else if (data.type === 'update_state' || data.type === 'sync') {
        if (ws.roomId && rooms[ws.roomId]) {
          // Zapisanie najnowszego stanu w pamięci
          if (data.payload) {
             rooms[ws.roomId].state = { ...rooms[ws.roomId].state, ...data.payload };
          }

          // Broadcast do wszystkich INNYCH klientów w pokoju
          rooms[ws.roomId].clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) { // 1 = WebSocket.OPEN
              client.send(JSON.stringify({ type: 'sync_state', payload: data.payload }));
            }
          });
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleLeaveRoom(ws);
  });
});

function handleLeaveRoom(ws) {
  if (ws.roomId && rooms[ws.roomId]) {
    rooms[ws.roomId].clients = rooms[ws.roomId].clients.filter(client => client !== ws);
    console.log(`Client left room: ${ws.roomId}`);

    // Jeśli pokój jest pusty, usuwamy go by zapobiec wyciekom pamięci
    if (rooms[ws.roomId].clients.length === 0) {
      console.log(`Room ${ws.roomId} deleted (empty)`);
      delete rooms[ws.roomId];
    }

    ws.roomId = null;
  }
}

server.listen(port, () => {
  console.log(`Server & WebSocket started on port ${port}`);
});
