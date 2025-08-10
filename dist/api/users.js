import { respondWithJSON } from "../json.js";
import { createUser, getUserById, updateUser } from "../db/queries/users.js";
import { BadRequestError, UserNotAuthorizedError } from "../errors.js";
import { hashPassword, getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
export async function handlerCreateUser(req, res) {
    const params = req.body;
    if (!params.email) {
        throw new BadRequestError("Missing email");
    }
    const hashedPassword = await hashPassword(params.password);
    const user = await createUser({
        email: params.email,
        hashedPassword: hashedPassword,
    });
    respondWithJSON(res, 201, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        isChirpyRed: user.isChirpyRed,
    });
}
export async function handlerUpdateUser(req, res) {
    const params = req.body;
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.api.jwtSecret);
    const user = await getUserById(userId);
    if (user.id !== userId) {
        throw new UserNotAuthorizedError("Unauthorized");
    }
    const hashedPassword = await hashPassword(params.password);
    const updatedUser = await updateUser({
        id: user.id,
        email: params.email,
        hashedPassword: hashedPassword,
    });
    respondWithJSON(res, 200, {
        id: updatedUser.id,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        email: updatedUser.email,
        isChirpyRed: user.isChirpyRed,
    });
}
