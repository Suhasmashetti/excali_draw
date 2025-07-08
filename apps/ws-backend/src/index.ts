import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (typeof decoded === "object" && "userId" in decoded && typeof decoded.userId === "string") {
      return decoded.userId;
    }
  } catch (e) {
    // Optional: console.error(e)
  }
  return null;
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const user: User = { ws, rooms: [], userId };
  users.push(user);

  ws.on("message", async function message(data) {
    let parsedData: any;
    try {
      parsedData = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (parsedData.type) {
      case "join_room":
        if (parsedData.roomId) user.rooms.push(parsedData.roomId);
        break;

      case "leave_room":
        user.rooms = user.rooms.filter(r => r !== parsedData.roomId);
        break;

      case "chat":
        const { roomId, message } = parsedData;
        if (!roomId || !message) return;

        await prismaClient.chat.create({
          data: {
            roomId: Number(roomId),
            message,
            userId
          }
        });

        users.forEach(u => {
          if (u.rooms.includes(roomId)) {
            u.ws.send(JSON.stringify({
              type: "chat",
              message,
              roomId
            }));
          }
        });
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    const index = users.findIndex(u => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
  });
});
