import express from "express";
import userRoutes from "./routes/user.routes.js"
import "dotenv/config";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Leaderboard server is running"
  });
});

const PORT= 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});