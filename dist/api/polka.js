import { updateUserIsChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
export async function handlerPolkaWebhooks(req, res) {
    const params = req.body;
    if (params.event !== "user.upgraded") {
        res.status(204).send();
        return;
    }
    const apiKey = getAPIKey(req);
    if (apiKey !== config.api.polkaKey) {
        res.status(401).send();
        return;
    }
    const user = await updateUserIsChirpyRed(params.data.userId);
    if (!user) {
        res.status(404).send();
        return;
    }
    res.status(204).send();
}
