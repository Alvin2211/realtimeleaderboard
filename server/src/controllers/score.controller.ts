import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getLeaderboardData } from "./leaderboard.controller.js";
import {broadcast} from "../websocket.js"

export async function createScore(req: Request, res: Response) {
  try {
    const { userId, gameId, score } = req.body;

    if (!userId || !gameId || score === undefined) {
      return res.status(400).json({
        message: "userId, gameId and score are required",
      });
    }

    if (typeof score !== "number" || !Number.isInteger(score)) {
      return res.status(400).json({
        message: "score must be an integer",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let leaderboardChanged = false;

    const result = await prisma.$transaction(async (tx) => {
      const existingScore = await tx.score.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

      // First score for this game
      if (!existingScore) {
        leaderboardChanged = true;

        return await tx.score.create({
          data: {
            userId,
            gameId,
            score,
          },
        });
      }

      // Score isn't better
      if (score <= existingScore.score) {
        return existingScore;
      }

      // New high score
      leaderboardChanged = true;

      return await tx.score.update({
        where: {
          id: existingScore.id,
        },
        data: {
          score,
        },
      });
    });

    // Only broadcast if leaderboard actually changed
    if (leaderboardChanged) {
      const leaderboard = await getLeaderboardData();

      broadcast({
        type: "leaderboardUpdate",
        leaderboard,
      });
    }

    return res.status(200).json({
      message: "Score processed",
      score: result,
    });

  } catch (error) {
    console.error("Score submission error:", error);

    return res.status(500).json({
      message: "Failed to submit score",
    });
  }
}