import express from "express";

import iotaRoutes from "./iota";

const router = express.Router();

// Add middleware to the routes
router.use("/iota", iotaRoutes);

export * from "./iota";
export * from "./types";
export default router;
