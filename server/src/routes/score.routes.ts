import { Router } from "express";
import { createScore } from "../controllers/score.controller.js";

const router = Router();

router.post("/", createScore);

export default router;