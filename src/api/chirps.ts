import { Request, Response } from "express";
import { BadRequestError } from "../errors.js";
import { createChirp, getAllChirps } from "../db/queries/chirps.js";
import { respondWithJSON } from "../json.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };
  const params: parameters = req.body;
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

export async function handlerGetAllChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();
  respondWithJSON(res, 200, chirps);
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
