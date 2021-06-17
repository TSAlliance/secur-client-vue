import { Router } from "vue-router";
import { SecurGuardConfig, SecurRouteGuard } from "./securGuard";
import { SecurStore } from "./securStore";

export interface SecurConfig {
  store: any;
  guard: {
    router: Router;
    config: SecurGuardConfig;
  };
}

export default {
  install: (app, options: SecurConfig) => {
    if (!options) {
      throw new Error(
        "Missing 'store' and 'error' property when initializing SecurPlugin."
      );
    }

    SecurStore.init(options.store);
    SecurRouteGuard.initRouteGuards(options.guard.router, options.guard.config);
  },
};
