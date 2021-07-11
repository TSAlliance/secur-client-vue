import { ApiError } from "@tsalliance/sdk";
import {
  ClientNetworkError,
  ClientInternalError,
} from "@tsalliance/sdk/lib/error/errors";
import { RouteLocationNormalized, RouteLocationRaw, Router } from "vue-router";

import { VueSecurClient } from "./securClient";
import { SecurAccountNotFoundError } from "@tsalliance/secur-node";
import { SecurErrorHandler } from "./securErrorHandler";
import { SecurStore } from "./securStore";

export abstract class SecurGuardConfig {
  homeRoute: RouteLocationRaw;
  loginRoute: RouteLocationRaw | string;
  errorHandler: SecurErrorHandler = undefined;
}

export class SecurRouteGuard {
  private static _config: SecurGuardConfig;

  /**
   * Set the SecurClient NavigationGuards to the router to make
   * use of the authorization process on routing
   * @param router Vue's router instance
   */
  public static initRouteGuards(router: Router, config: SecurGuardConfig) {
    this._config = config;

    // Gather user's data before routing (check if logged in)
    router.beforeEach((to, from, next) => {
      if (to.query.accessToken) {
        const query = Object.assign({}, to.query);
        const token: string = to.query.accessToken.toString();

        SecurStore.clear();
        SecurStore.setSessionToken(token);

        delete query.accessToken;
        router.replace({ query });
      }

      next();

      const memberCached = SecurStore.getMemberCached();
      const sessionExistedBefore = !!memberCached;

      if (!from.meta.requiresAuth && to.meta.requiresAuth) {
        SecurStore.setSecurReady(false);
      }

      if (!to.meta.requiresAuth) {
        SecurStore.setSecurReady(true);
      }

      // If no member data exist in store, the user is considered logged out
      if (!sessionExistedBefore) {
        if (to.meta.requiresAuth) {
          VueSecurClient.login()
            .then((member) => {
              SecurStore.setSecurReady(true);
              console.info(
                "[" +
                  member.uuid +
                  "]<" +
                  member.username +
                  "> successfully logged in."
              );
            })
            .catch((error: ApiError) => {
              this.handleError(sessionExistedBefore, error, router, to, from);
            });
        } else {
          VueSecurClient.login()
            .then((member) => {
              SecurStore.setSecurReady(true);
              console.info(
                "[" +
                  member.uuid +
                  "]<" +
                  member.username +
                  "> successfully logged in."
              );
            })
            .catch((error: ApiError) => {
              this.handleError(sessionExistedBefore, error, router, to);
            });
        }
      } else {
        SecurStore.getStore().state.member = memberCached.member;

        if (memberCached.isExpired()) {
          console.info(
            "[" +
              memberCached.member.uuid +
              "]<" +
              memberCached.member.username +
              ">: Expired. Verifying session..."
          );

          VueSecurClient.verify()
            .then(() => {
              console.info(
                "[" +
                  memberCached.member.uuid +
                  "]<" +
                  memberCached.member.username +
                  ">: Session verified."
              );
              SecurStore.setSecurReady(true);
            })
            .catch((error: ApiError) => {
              this.handleError(sessionExistedBefore, error, router, to);
            });
        } else {
          console.info(
            "[" +
              memberCached.member.uuid +
              "]<" +
              memberCached.member.username +
              ">: Session still valid."
          );
          SecurStore.updateMember(memberCached.member);
          SecurStore.setSecurReady(true);
        }
      }
    });
  }

  private static handleError(
    sessionExistedBefore: boolean,
    error: ApiError,
    router: Router,
    toRoute: RouteLocationNormalized = undefined,
    fromRoute: RouteLocationNormalized = undefined
  ) {
    const routeRequiresAuth = toRoute ? toRoute.meta.requiresAuth : false;

    if (
      error instanceof ClientInternalError ||
      error instanceof ClientNetworkError
    ) {
      if (routeRequiresAuth || (fromRoute && fromRoute.meta.requiresAuth)) {
        if (!SecurStore.getStore().state.member) {
          if (fromRoute) {
            this.routerPush(router, fromRoute);
          } else {
            this.routerPush(router, this._config.homeRoute);
          }
        }
      }

      if (this._config.errorHandler && this._config.errorHandler.handleError) {
        this._config.errorHandler.handleError(error);
      }
    } else {
      // In every other errors case -> logout user
      VueSecurClient.logout();

      if (sessionExistedBefore) {
        // If a session existed before, a message should be shown
        if (error instanceof SecurAccountNotFoundError) {
          if (
            this._config.errorHandler &&
            this._config.errorHandler.handleAccountNotFound
          ) {
            this._config.errorHandler.handleAccountNotFound(error);
          }
        } else {
          if (
            this._config.errorHandler &&
            this._config.errorHandler.handleSessionExpired
          ) {
            this._config.errorHandler.handleSessionExpired(error);
          }
        }
      }

      if (routeRequiresAuth) {
        // If the route requires the user to be authenticated -> push to Login
        this.routerPush(router, this._config.loginRoute);
      }
    }
  }

  private static routerPush(router: Router, route: RouteLocationRaw | string) {
    if (typeof route == "string") {
      window.location.href = route;
    } else {
      router.push(route);
    }
  }
}
