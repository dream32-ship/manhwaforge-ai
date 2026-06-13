import { ENV } from "./env";

/**
 * Exchange Google authorization code for user info
 * This is a simplified implementation that works with Google OAuth 2.0
 */
export async function exchangeGoogleCodeForUser(code: string, redirectUri: string) {
  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.VITE_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("[Google OAuth] Token exchange failed:", error);
      throw new Error("Failed to exchange Google authorization code");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error("Failed to fetch Google user info");
    }

    const userInfo = await userInfoResponse.json();

    return {
      openId: `google_${userInfo.id}`,
      email: userInfo.email,
      name: userInfo.name,
      loginMethod: "google",
    };
  } catch (error) {
    console.error("[Google OAuth] Error:", error);
    throw error;
  }
}
