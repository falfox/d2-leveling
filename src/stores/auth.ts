import {
  action,
  Action,
  computed,
  Computed,
  createContextStore,
} from "easy-peasy";
import {
  STORAGE_ACCESS_TOKEN_EXPIRATION_KEY,
  STORAGE_ACCESS_TOKEN_KEY,
  STORAGE_ACTIVE_CHAR_ID,
  STORAGE_DESTINY_CHARACTERS_KEY,
  STORAGE_DESTINY_MEMBERSHIPS_KEY,
  STORAGE_REFRESH_TOKEN_KEY,
} from "../consts";
import { redirectToAuthPromp } from "../services/auth";

interface AuthStoreModel {
  refresh_token: string | null;
  access_token: string | null;
  access_token_expired_at: number;
  // logged_in: Computed<AuthStoreModel, boolean>;
  state: "uninitialize" | "logging_in" | "logged_in" | "error";

  setState: Action<AuthStoreModel, AuthStoreModel["state"]>;
  loginWithBungie: Action<AuthStoreModel>;
  logout: Action<AuthStoreModel>;
}

export const AuthStore = createContextStore<AuthStoreModel>({
  // logged_in: computed((state) => state.refresh_token != null),
  refresh_token: localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY),
  access_token: localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY),
  access_token_expired_at: parseInt(
    localStorage.getItem(STORAGE_ACCESS_TOKEN_EXPIRATION_KEY) ?? "0"
  ),
  state: localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY)
    ? "logged_in"
    : "uninitialize",

  setState: action((state, payload) => {
    state.state = payload;
  }),
  loginWithBungie: action((state, _) => {
    redirectToAuthPromp();
  }),
  logout: action((state) => {
    localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
    localStorage.removeItem(STORAGE_ACCESS_TOKEN_EXPIRATION_KEY);

    localStorage.removeItem(STORAGE_ACTIVE_CHAR_ID);
    localStorage.removeItem(STORAGE_DESTINY_MEMBERSHIPS_KEY);
    localStorage.removeItem(STORAGE_DESTINY_CHARACTERS_KEY);
    state.access_token = null;
    state.refresh_token = null;
    state.access_token_expired_at = 0;
    state.state = "uninitialize";
  }),
});
