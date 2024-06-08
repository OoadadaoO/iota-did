import express from "express";

import didRoutes from "./dids";

const router = express.Router();

// Add middleware to the routes
router.use("/dids", didRoutes);

export * from "./dids";
export * from "./types";
export default router;
