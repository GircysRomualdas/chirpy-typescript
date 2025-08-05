import { config } from "../config.js";
export async function handlerReset(req, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    config.fileserverHits = 0;
    res.send("Hits reset to 0");
    res.end();
}
