import multer from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Local disk storage for uploads
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).user?.id || "anon";
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${userId}_profile${ext}`);
  },
});

const upload: multer.Multer = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: any,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export { upload };