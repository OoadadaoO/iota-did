import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import { env } from "./env";
import iotaRoutes from "./routes";

const app = express();
const port = env.PORT || 8001;

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.send("Hello World!");
});
app.use("/api/iota", iotaRoutes);

app.listen(port, () => {
  console.log(`Server is listening on: http://localhost:${port}`);
});
