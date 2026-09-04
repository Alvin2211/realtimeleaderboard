import { WebSocketServer, WebSocket } from "ws";
import { getLeaderboardData } from "./controllers/leaderboard.controller.js";

export const clients = new Set<WebSocket>();

export function initializeWebSocket(wss: WebSocketServer) {
  wss.on("connection", async (socket) => {
    console.log("WebSocket client connected");

    clients.add(socket);

    // Tell client that connection was successful
    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to leaderboard WebSocket",
      })
    );

    try {
      const leaderboard = await getLeaderboardData();

      socket.send(
        JSON.stringify({
          type: "leaderboardUpdate",
          leaderboard,
        })
      );
    } catch (error) {
      console.error("Failed to send leaderboard:", error);

      socket.send(
        JSON.stringify({
          type: "error",
          message: "Failed to fetch leaderboard",
        })
      );
    }

    socket.on("close", () => {
      console.log("WebSocket client disconnected");

      clients.delete(socket);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);

      clients.delete(socket);
    });
  });
}

export function broadcast(data: unknown) {
  const message = JSON.stringify(data);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}