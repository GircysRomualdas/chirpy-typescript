import { Request, Response } from "express";
import { respondWithJSON } from "../json.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
  createRefreshToken,
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh_tokens.js";
import { UserNotAuthorizedError } from "../errors.js";
import {
  checkPasswordHash,
  makeJWT,
  makeRefreshToken,
  getBearerToken,
} from "../auth.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;
  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UserNotAuthorizedError("Incorrect email or password");
  }
  const matching = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );
  if (!matching) {
    throw new UserNotAuthorizedError("Incorrect email or password");
  }
  let expiresIn = 3600;
  const jwtToken = makeJWT(user.id, expiresIn, config.api.jwtSecret);
  const token = makeRefreshToken();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const refreshToken = await createRefreshToken({
    token: token,
    userId: user.id,
    expiresAt: expiresAt,
  });
  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    isChirpyRed: user.isChirpyRed,
    token: jwtToken,
    refreshToken: refreshToken.token,
  });
}

export async function handlerRefresh(req: Request, res: Response) {
  const tokenJWT = getBearerToken(req);
  const refreshToken = await getRefreshToken(tokenJWT);
  if (!refreshToken) {
    throw new UserNotAuthorizedError("Refresh token not found");
  }
  if (refreshToken.expiresAt < new Date()) {
    throw new UserNotAuthorizedError("Refresh token expired");
  }
  if (refreshToken.revokedAt) {
    throw new UserNotAuthorizedError("Refresh token revoked");
  }
  const userId = refreshToken.userId;
  const expiresIn = 3600;
  const newJWT = makeJWT(userId, expiresIn, config.api.jwtSecret);
  respondWithJSON(res, 200, {
    token: newJWT,
  });
}

export async function handlerRevoke(req: Request, res: Response) {
  const tokenJWT = getBearerToken(req);
  await revokeRefreshToken(tokenJWT);
  res.status(204).send();
}
