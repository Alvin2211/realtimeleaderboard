import fs from "fs"
import {prisma} from "../src/lib/prisma"

const users = await prisma.user.findMany({
  select: {
    id: true,
  },
});

fs.writeFileSync(
  "users.json",
  JSON.stringify(users.map(u => u.id), null, 2)
);

console.log(`Saved ${users.length} user IDs`);