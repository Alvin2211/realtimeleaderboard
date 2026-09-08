import { WebSocketServer, WebSocket } from "ws";

import {
  getTopPlayers,
} from "./services/redisLeaderboard.js";

import { prisma } from "./lib/prisma.js";

export const clients = new Set<WebSocket>();

const TOP_N = 10;

export async function getTopPlayersForWebSocket() {
  const redisPlayers = await getTopPlayers(TOP_N);

  const userIds = redisPlayers.map(
    (player) => player.value
  );

  if (userIds.length === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  const userMap = new Map(
    users.map((user) => [user.id, user.username])
  );

  return redisPlayers.map((player, index) => ({
    rank: index + 1,
    userId: player.value,
    username: userMap.get(player.value),
    totalScore: player.score,
  }));
}

export function initializeWebSocket(wss: WebSocketServer) {
  wss.on("connection", async (socket) => {
    console.log("WebSocket client connected");

    clients.add(socket);

    socket.send(
      JSON.stringify({
        type: "connected",
        message: "Connected to leaderboard WebSocket",
      })
    );

    try {
      const leaderboard = await getTopPlayersForWebSocket();

      socket.send(
        JSON.stringify({
          type: "leaderboardUpdate",
          leaderboard,
        })
      );
    } catch (error) {
      console.error(
        "Failed to fetch leaderboard:",
        error
      );

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

export function broadcastLeaderboard() {
  getTopPlayersForWebSocket()
    .then((leaderboard) => {
      broadcast({
        type: "leaderboardUpdate",
        leaderboard,
      });
    })
    .catch((error) => {
      console.error(
        "Failed to broadcast leaderboard:",
        error
      );
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