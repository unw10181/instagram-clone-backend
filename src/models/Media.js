import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ["image", "video"], required: true },
    caption: { type: String, default: "" },

    // Cloudinary URLs
    url: { type: String, required: true },
    publicId: { type: String, required: true },

    // Optional metadata
    width: Number,
    height: Number,
    duration: Number,
  },
  { timestamps: true },
);

export const Media = mongoose.model("Media", MediaSchema);
