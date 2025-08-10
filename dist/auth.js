import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserNotAuthorizedError, BadRequestError } from "./errors.js";
export async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}
export async function checkPasswordHash(password, hash) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}
const TOKEN_ISSUER = "chirpy";
export function makeJWT(userID, expiresIn, secret) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: issuedAt,
        exp: expiresAt,
    }, secret, { algorithm: "HS256" });
    return token;
}
export function validateJWT(tokenString, secret) {
    let decoded;
    try {
        decoded = jwt.verify(tokenString, secret);
    }
    catch (e) {
        throw new UserNotAuthorizedError("Invalid token");
    }
    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthorizedError("Invalid issuer");
    }
    if (!decoded.sub) {
        throw new UserNotAuthorizedError("No user ID in token");
    }
    return decoded.sub;
}
export function getBearerToken(req) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthorizedError("Invalid authorization header");
    }
    return extractToken(authHeader, "Bearer");
}
function extractToken(header, startWith) {
    const splitAuth = header.split(" ");
    if (splitAuth.length < 2 || splitAuth[0] !== startWith) {
        throw new BadRequestError("Invalid authorization header");
    }
    return splitAuth[1];
}
export function getAPIKey(req) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthorizedError("Invalid authorization header");
    }
    return extractToken(authHeader, "ApiKey");
}
export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}
