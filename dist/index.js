import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./middlerware/log_responses.js";
const app = express();
const PORT = 8080;
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);
app.get("/healthz", handlerReadiness);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
