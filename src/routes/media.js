import { Router } from "express";
import multer from "multer";
import { Media } from "../models/Media.js";
import { initCloudinary } from "../config/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = initCloudinary();

/** GET feed */
router.get("/", async (_req, res) => {
  try {
    const items = await Media.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("GET /api/media error:", err);
    res.status(500).json({ message: "Failed to load media" });
  }
});

/** POST upload (multipart: file, caption?) */
router.post(
  "/",
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "File missing" });

      const mediaType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "instagramclone",
            resource_type: mediaType === "video" ? "video" : "image",
          },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
        );
        stream.end(req.file.buffer);
      });

      const doc = await Media.create({
        mediaType,
        caption: req.body.caption || "",
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        duration: result.duration,
      });

      res.status(201).json(doc);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  },
);

/** PATCH caption */
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Media.findByIdAndUpdate(
      req.params.id,
      { caption: req.body.caption ?? "" },
      { new: true },
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("PATCH /api/media/:id error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/** DELETE media (also remove from cloudinary) */
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Media.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    await cloudinary.uploader.destroy(doc.publicId, {
      resource_type: doc.mediaType === "video" ? "video" : "image",
    });

    await Media.deleteOne({ _id: doc._id });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/media/:id error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
