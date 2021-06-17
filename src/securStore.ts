import { SecurCookieManager } from "./securCookie";
import { SecurMember, SecurMemberCached } from "./securMember";

const COOKIE_SESSION_TOKEN = "tsalliance_sess::token";
const COOKIE_SESSION_VERIFY = "tsalliance_sess::verify";

const LOCAL_STORAGE_ACC_DATA_KEY = "tsalliance_account_data";

export class SecurStore {
  private static store;

  /**
   * Initialize store
   * @param _store
   */
  public static init(_store) {
    this.store = _store;

    if (!this.store.state.secur) {
      this.store.state.secur = {
        read: false as boolean,
        member: undefined as SecurMember,
      };
    }
  }

  /**
   * Get Vuex store
   * @returns Store
   */
  public static getStore() {
    return this.store;
  }

  /**
   * Get session token from browser's cookie storage
   * @returns Value as string
   */
  public static getSessionToken(): string {
    return SecurCookieManager.get(COOKIE_SESSION_TOKEN);
  }

  /**
   * Set session token as cookie in browsers
   * @param token Token's value
   */
  public static setSessionToken(token: string): void {
    SecurCookieManager.set({
      name: COOKIE_SESSION_TOKEN,
      value: token,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: "/",
    });
  }

  /**
   * Clear all user data
   */
  public static clear() {
    localStorage.clear();
    this.store.state.secur.member = null;
    SecurCookieManager.remove(COOKIE_SESSION_TOKEN);
    SecurCookieManager.remove(COOKIE_SESSION_VERIFY);
  }

  /**
   * Update member's data
   * @param member Updated data
   */
  public static updateMember(member: SecurMember) {
    this.store.state.secur.member = member;

    localStorage.setItem(LOCAL_STORAGE_ACC_DATA_KEY, JSON.stringify(member));
    SecurCookieManager.setWithRandomValue({
      name: COOKIE_SESSION_VERIFY,
      maxAgeSeconds: 3600,
      path: "/",
    });
  }

  /**
   * Login user using data in localStorage. If no session cookie exists, null is returned
   * @returns Instance of SecurMember
   */
  public static getMemberCached(): SecurMemberCached {
    if (SecurCookieManager.exists(COOKIE_SESSION_VERIFY)) {
      const data: SecurMember = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_ACC_DATA_KEY)
      );

      if (data) return new SecurMemberCached(data);
    }

    return null;
  }

  /**
   * Check if a verification token is existing
   * @returns True or False
   */
  public static existsSecurVerifyToken(): boolean {
    return !SecurCookieManager.exists(COOKIE_SESSION_VERIFY);
  }

  /**
   * Set the app to be ready
   * @param isReady
   */
  public static setSecurReady(isReady: boolean) {
    this.store.state.secur.ready = isReady;
  }
}
