import { Router } from "express";
import userRouter from "./user.route"
import roommatesRouter from "./tenant.route";
import chatRouter from "./chat.route"
import propertiesRouter from "./properties.route";
import botRouter from "./bot.route";
const api = Router();

api.use("/users", userRouter)
api.use("/roommates", roommatesRouter)
api.use("/chats", chatRouter)
api.use("/properties", propertiesRouter)
api.use("/houses", propertiesRouter)

api.use("/bot", botRouter)

export default api;