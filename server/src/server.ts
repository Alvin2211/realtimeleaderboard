import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import userRoutes from "./routes/user.routes.js"
import scoreRoutes from "./routes/score.routes.js"
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import { initializeWebSocket } from "./websocket.js";
import { broadcast } from "./websocket.js";
import { connectRedis } from "./lib/redis.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/scores",scoreRoutes);
app.use("/api/leaderboard", leaderboardRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Leaderboard server is running"
  });
});

const PORT= 5000;

const server = createServer(app);

const wss = new WebSocketServer({
  server,
});

initializeWebSocket(wss);


async function startServer() {
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket running on ws://localhost:${PORT}`);
  });
}
startServer();

app.get("/test/broadcast", (req, res) => {
  broadcast({
    type: "test",
    message: "Hello from server!",
  });

  res.json({
    message: "Broadcast sent",
  });
});

