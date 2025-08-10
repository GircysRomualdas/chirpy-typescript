import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerCreateUser, handlerUpdateUser } from "./api/users.js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth.js";
import {
  handlerCreateChirp,
  handlerGetAllChirps,
  handlerChirpsGet,
  handlerChirpsDelete,
} from "./api/chirps.js";
import { handlerPolkaWebhooks } from "./api/polka.js";
import { middlewareLogResponses } from "./middleware/log_responses.js";
import { middlewareMetricsInc } from "./middleware/metrics.js";
import { middlewareErrorHandler } from "./middleware/error_handler.js";
import { config } from "./config.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);

app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);

app.post("/api/users", handlerCreateUser);
app.put("/api/users", handlerUpdateUser);

app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerChirpsGet);
app.delete("/api/chirps/:chirpId", handlerChirpsDelete);

app.post("/api/polka/webhooks", handlerPolkaWebhooks);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running on port ${config.api.port}`);
});
