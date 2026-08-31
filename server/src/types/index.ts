interface User {
  id: string;
  username: string;
  createdAt: Date;
}

interface Score {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  createdAt: Date;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

export{
    User,Score,LeaderboardEntry
}