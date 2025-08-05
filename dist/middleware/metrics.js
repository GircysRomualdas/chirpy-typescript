import { config } from "../config.js";
export async function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
