import * as express from "express";
import Logger from "@shared//Logger";
import * as admin from "firebase-admin";

const logger = new Logger("RequestUtil");
export async function getAuthUser(request: express.Request): Promise<admin.auth.UserRecord | undefined> {
    try {
        const startTime = new Date().getTime();
        const userId = await getAuthUserId(request);
        if (userId) {
            const user = await admin.auth().getUser(userId);
            const endTime = new Date().getTime();
            logger.log(`Get auth user took ${endTime - startTime}ms`);
            return user;
        }
        return;
    } catch (error) {
        logger.error("Failed to get user", error);
        return;
    }
}

export async function getAuthUserId(request: express.Request): Promise<string | undefined> {
    const startTime = new Date().getTime();
    const bearer = request.headers.authorization;
    if (!bearer) {
        return;
    }

    const [, token] = bearer.split("Bearer ");
    if (!token) {
        return undefined;
    }
    try {
        const verifiedToken = await admin.auth().verifyIdToken(token);
        const endTime = new Date().getTime();
        logger.log(`Verify auth bearer took ${endTime - startTime}ms`);
        return verifiedToken.uid;
    } catch (error) {
        logger.error("Unable to verify ID token or get a user", error);
        return undefined;
    }
}
