import { Request, Response } from "express";
import { getTopPlayersFromPostgres } from "../services/pgLeaderboard.js";

export async function getTopPlayersPostgres(
  req: Request,
  res: Response
) {
  try {
    const leaderboard = await getTopPlayersFromPostgres(10);

    const formattedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player,
    }));

    return res.status(200).json({
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error("PostgreSQL leaderboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
}