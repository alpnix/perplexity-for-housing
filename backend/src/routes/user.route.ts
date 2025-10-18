// routes/user.route.ts
import { Router } from "express";
import { getProfile, login, registerUser, updateProfile, uploadProfileImage, getProfileById } from "../controllers/user.controller";
import { makePayment } from "../controllers/user.controller";
import { validateLogin, validateProfileUpdate, validateRegisterUser } from "../validations/user.validator";
import authMiddleware from "../middlewares/auth.middleware";
import { upload } from "../utils/fileHandler";

const userRouter = Router();

userRouter.post("/register", validateRegisterUser, registerUser);
userRouter.post("/login", validateLogin, login);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.get("/profile/:id", authMiddleware, getProfileById);
userRouter.put("/profile/update", authMiddleware, validateProfileUpdate, updateProfile);
userRouter.post("/upload-image", authMiddleware, upload.single("image"), uploadProfileImage);
userRouter.post("/register", validateRegisterUser, registerUser)
userRouter.post("/login", validateLogin, login)
userRouter.post("/payment", makePayment);

export default userRouter;