import { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "../errors.js";
import {
  createChirp,
  getAllChirps,
  getChirpById,
  deleteChirp,
} from "../db/queries/chirps.js";
import { respondWithJSON } from "../json.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };
  const params: parameters = req.body;
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);
  const validChirp = validateChirp(params.body);
  const chirp = await createChirp({
    body: validChirp,
    userId: userId,
  });
  respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

export async function handlerGetAllChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();
  respondWithJSON(res, 200, chirps);
}

export async function handlerChirpsGet(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  }
  respondWithJSON(res, 200, chirp);
}

function validateChirp(body: string): string {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }
  const badWords = ["kerfuffle", "sharbert", "fornax"];
  const cleanedBody = getCleanedBody(body, badWords);
  return cleanedBody;
}

function getCleanedBody(body: string, badWords: string[]): string {
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

export async function handlerChirpsDelete(req: Request, res: Response) {
  const chirpId = req.params.chirpId;
  const chirp = await getChirpById(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID ${chirpId} not found`);
  }
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);
  if (chirp.userId !== userId) {
    throw new UserForbiddenError("Unauthorized");
  }
  await deleteChirp(chirpId);
  res.status(204).send();
}
