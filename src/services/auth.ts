import { stringify } from "query-string";
import { VITE_BUNGIE_CLIENT_ID, VITE_BUNGIE_CLIENT_SECRET } from "../config";
import {
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_ACCESS_TOKEN_EXPIRATION_KEY,
  STORAGE_MEMBERSHIP_ID_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
} from "../consts";

interface AccessTokenResponseBody {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  membership_id: string;
  refresh_expires_in: number;
  refresh_token: string;
}

export async function redirectToAuthPromp() {
  window.location.assign(
    `https://www.bungie.net/en/OAuth/Authorize?${stringify({
      response_type: "code",
      client_id: VITE_BUNGIE_CLIENT_ID,
      client_secret: VITE_BUNGIE_CLIENT_SECRET,
    })}`
  );
}

export async function getAccessToken(code?: string) {
  const refresh_token = localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY);
  const response = await fetch(
    "https://www.bungie.net/platform/app/oauth/token/",
    {
      method: "POST",
      body: stringify(
        code
          ? {
              grant_type: "authorization_code",
              code,
              client_id: VITE_BUNGIE_CLIENT_ID,
              client_secret: VITE_BUNGIE_CLIENT_SECRET,
            }
          : {
              grant_type: "refresh_token",
              refresh_token,
              client_id: VITE_BUNGIE_CLIENT_ID,
              client_secret: VITE_BUNGIE_CLIENT_SECRET,
            }
      ),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (response.status !== 200) {
    throw new Error("Failed to authenticate");
  }

  const data = (await response.json()) as AccessTokenResponseBody;

  persistAccessTokenResponse(data);
  return data;
}

function persistAccessTokenResponse(data: AccessTokenResponseBody) {
  localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, data.access_token);
  localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, data.refresh_token);
  localStorage.setItem(
    STORAGE_ACCESS_TOKEN_EXPIRATION_KEY,
    (new Date().getTime() + data.expires_in * 1000).toString()
  );
  localStorage.setItem(STORAGE_MEMBERSHIP_ID_KEY, data.membership_id);
}
