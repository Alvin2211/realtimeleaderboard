import { Router } from "express";
import {
  getTopPlayers,
  getPlayerRank,
} from "../controllers/leaderboard.controller.js";
import { getTopPlayersPostgres } from "../controllers/pgLeaderboard.controller.js";

const router = Router();

router.get("/", getTopPlayers);
router.get("/pg",getTopPlayersPostgres);
router.get("/:userId", getPlayerRank);

export default router;