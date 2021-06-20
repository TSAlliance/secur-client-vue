import { RouteLocationRaw, Router } from "vue-router";

import { ApiError } from "alliance-client-lib/lib/error";
import {
  ClientInternalError,
  ClientNetworkError,
} from "alliance-client-lib/lib/errors";
import {
  AllianceApiService,
  AllianceRouteMethod,
} from "alliance-client-lib/lib/router";
import { SecurMember } from "./securMember";
import {
  SecurAccountNotFoundError,
  SecurInvalidSessionError,
} from "./securError";
import { SecurStore } from "./securStore";

export class SecurClient {
  /**
   * Destroys the user's session in the browser.
   * You should redirect the user back to a login page after the logout process.
   * @returns Promise of type void
   */
  public static async logout(): Promise<void> {
    SecurStore.clear();
  }

  /**
   * Destroys the user's session in the browser and redirects
   * to specific route
   * @param router Router's instance
   * @param route Route object
   * @returns Promise of type void
   */
  public static async logoutAndRedirect(
    router: Router,
    route: RouteLocationRaw
  ): Promise<void> {
    if (!window) return;
    this.logout().then(() => router.push(route));
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
        .then((member) => {
          this.update(member);
          resolve();
        })
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
    return new Promise((resolve, reject) => {
      AllianceApiService.getInstance()
        .request<SecurMember>({
          method: AllianceRouteMethod.GET,
          path: "/members/:id",
          params: {
            id: "@me",
          },
          authRequired: true,
        })
        .perform(false)
        .then((member) => {
          this.update(member);
          resolve(member);
        })
        .catch((error: ApiError) => {
          if (error.statusCode) {
            if (error.statusCode == 404) {
              reject(new SecurAccountNotFoundError());
            } else {
              reject(new SecurInvalidSessionError());
            }
          } else {
            if (error.message == "Network Error") {
              reject(new ClientNetworkError());
            } else {
              reject(new ClientInternalError());
              console.error(error);
            }
          }
        });
    });
  }
}
