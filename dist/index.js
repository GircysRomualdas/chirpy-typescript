import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { middlewareLogResponses } from "./middleware/log_responses.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
const app = express();
const PORT = 8080;
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
