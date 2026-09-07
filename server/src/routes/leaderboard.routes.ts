import { Router } from "express";
import {
  getTopPlayers,
  getPlayerRank,
} from "../controllers/leaderboard.controller.js";

const router = Router();

router.get("/", getTopPlayers);
router.get("/:userId", getPlayerRank);

export default router;