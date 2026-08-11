import { Router } from "express";
import { db } from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const subjects = db.prepare("SELECT * FROM subjects ORDER BY id").all();
  res.json(subjects);
});

export default router;
