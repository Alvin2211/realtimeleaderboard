import { prisma } from "../src/lib/prisma.js";
import { connectRedis, redis } from "../src/lib/redis.js";

const LEADERBOARD_KEY = "leaderboard:global";

async function buildLeaderboard() {
  await connectRedis();

  console.log("Fetching users from PostgreSQL...");

  const users = await prisma.user.findMany({
    include: {
      scores: true,
    },
  });

  console.log(`Found ${users.length} users.`);

  await redis.del(LEADERBOARD_KEY);

  const entries = users.map((user) => {
    const totalScore = user.scores.reduce(
      (total, score) => total + score.score,
      0
    );

    return {
      score: totalScore,
      value: user.id,
    };
  });

  if (entries.length > 0) {
    await redis.zAdd(LEADERBOARD_KEY, entries);
  }

  console.log(
    `Added ${entries.length} users to Redis leaderboard.`
  );

  await prisma.$disconnect();
  await redis.quit();
}

buildLeaderboard().catch(async (error) => {
  console.error(error);

  await prisma.$disconnect();

  if (redis.isOpen) {
    await redis.quit();
  }

  process.exit(1);
});