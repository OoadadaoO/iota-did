import express from "express";

import didRoutes from "./dids";
import revokeRoutes from "./revoke";
import validateRoute from "./validate";
import vcRoutes from "./vc";

const router = express.Router();

// Add middleware to the routes
router.use("/dids", didRoutes);
router.use("/vc", vcRoutes);
router.use("/validate", validateRoute);
router.use("/revoke", revokeRoutes);

export * from "./dids";
export * from "./vc";
export * from "./validate";
export * from "./revoke";
export * from "./types";
export default router;
