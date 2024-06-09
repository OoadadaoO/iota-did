import express from "express";

import didRoutes from "./dids";
import vcRoutes from "./vc";

const router = express.Router();

// Add middleware to the routes
router.use("/dids", didRoutes);
router.use("/vc", vcRoutes);

export * from "./dids";
export * from "./vc";
export * from "./types";
export default router;
