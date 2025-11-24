import { Router } from "express";
import { getHome } from "../src/controllers/homeController.js";

const router = Router();

router.get("/home", getHome);

export default router;
