import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Post } from "../models/Post.js";

const router = Router();

// CREATE
router.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { imageUrl, caption } = req.body;

  const post = await Post.create({
    author: req.userId,
    imageUrl,
    caption,
  });

  res.status(201).json(post);
});

// READ ALL
router.get("/", requireAuth, async (_req, res) => {
  const posts = await Post.find()
    .populate("author", "username avatarUrl")
    .sort({ createdAt: -1 });

  res.json(posts);
});

// UPDATE
router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.userId },
    { caption: req.body.caption },
    { new: true },
  );

  if (!post) return res.status(404).json({ message: "Not found" });

  res.json(post);
});

// DELETE
router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const deleted = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.userId,
  });

  if (!deleted) return res.status(404).json({ message: "Not found" });

  res.status(204).send();
});

// LIKE
router.post("/:id/like", requireAuth, async (req: AuthedRequest, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.userId } },
    { new: true },
  );

  res.json(post);
});

// UNLIKE
router.post("/:id/unlike", requireAuth, async (req: AuthedRequest, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.userId } },
    { new: true },
  );

  res.json(post);
});

export default router;
