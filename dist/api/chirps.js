import { BadRequestError } from "../errors.js";
import { createChirp, getAllChirps } from "../db/queries/chirps.js";
import { respondWithJSON } from "../json.js";
export async function handlerCreateChirp(req, res) {
    const params = req.body;
    const validChirp = validateChirp(params.body);
    const chirp = await createChirp({
        body: validChirp,
        userId: params.userId,
    });
    respondWithJSON(res, 201, {
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
    });
}
export async function handlerGetAllChirps(req, res) {
    const chirps = await getAllChirps();
    respondWithJSON(res, 200, chirps);
}
function validateChirp(body) {
    const maxChirpLength = 140;
    if (body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    const cleanedBody = getCleanedBody(body, badWords);
    return cleanedBody;
}
function getCleanedBody(body, badWords) {
    const words = body.split(" ");
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const lowerWord = word.toLowerCase();
        if (badWords.includes(lowerWord)) {
            words[i] = "****";
        }
    }
    const cleaned = words.join(" ");
    return cleaned;
}
