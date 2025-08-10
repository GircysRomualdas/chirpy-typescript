import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { users } from "../schema.js";
export async function createUser(user) {
    const [result] = await db.insert(users).values(user).returning();
    return result;
}
export async function getUserByEmail(email) {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
}
export async function getUserById(id) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
}
export async function reset() {
    await db.delete(users);
}
export async function updateUser(user) {
    const { id, ...updates } = user;
    const [result] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
    return result;
}
export async function updateUserIsChirpyRed(userId) {
    const [result] = await db
        .update(users)
        .set({ isChirpyRed: true })
        .where(eq(users.id, userId))
        .returning();
    return result;
}
