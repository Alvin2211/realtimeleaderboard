import { prisma } from "../src/lib/prisma.js";

const TOTAL_USERS = 100000;

const games = [
  "game1",
  "game2",
  "game3",
  "game4",
  "game5",
];

async function main() {
  console.log(`Seeding ${TOTAL_USERS} users...`);

  const users = [];

  for (let i = 0; i < TOTAL_USERS; i++) {
    users.push({
      username: `user_${i}`,
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log("Users created.");

  const createdUsers = await prisma.user.findMany({
    select: {
      id: true,
    },
  });

  console.log(`Found ${createdUsers.length} users.`);

  const scores = [];

  for (const user of createdUsers) {
    for (const gameId of games) {
      scores.push({
        userId: user.id,
        gameId,
        score: Math.floor(Math.random() * 100000),
      });
    }
  }

  console.log(`Creating ${scores.length} scores...`);

  await prisma.score.createMany({
    data: scores,
    skipDuplicates: true,
  });

  console.log("Scores created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });