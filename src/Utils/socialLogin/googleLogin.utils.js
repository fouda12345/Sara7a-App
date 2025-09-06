import { OAuth2Client } from 'google-auth-library';

export const verifyGoogleLogin = async ({ idToken }) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}