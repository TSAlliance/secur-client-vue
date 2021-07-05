import { SecurClient as NodeSecurClient, SecurMember } from "secur-node";
import { SecurStore } from "./securStore";

export class VueSecurClient {
  /**
   * Destroys the user's session in the browser.
   * You should redirect the user back to a login page after the logout process.
   * @returns Promise of type void
   */
  public static async logout(): Promise<void> {
    SecurStore.clear();
  }

  /**
   * Refetch user's data using the current session token.
   * This determines the session's is invalidity if an error is thrown.
   * The retrieved user data is considered updated, so therefor this data is automatically
   * saved to the SecurStore.
   * @returns Promise of type void
   */
  public static async verify(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.login()
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }

  /**
   * Update user's data in Vue-Store and localStorage
   * @param member User's data
   */
  public static update(member: SecurMember) {
    SecurStore.updateMember(member);
  }

  /**
   * Load client's data
   * @returns Promise of type SecurMember
   */
  public static async login(): Promise<SecurMember> {
    const promise = NodeSecurClient.loginWithToken(
      SecurStore.getSessionToken()
    );
    promise.then((member: SecurMember) => {
      this.update(member);
    });
    return promise;
  }
}
