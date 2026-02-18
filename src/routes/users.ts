import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.get("/me", requireAuth, async (req: any, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  res.json(user);
});

router.get("/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).select(
    "-passwordHash",
  );

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

export default router;
