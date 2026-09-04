import { Router } from "express";
import { getGlobalLeaderboard , getUserLeaderboardRank } from "../controllers/leaderboard.controller.js";

const router = Router();

router.get("/", getGlobalLeaderboard);
router.get("/:userId", getUserLeaderboardRank);


export default router;