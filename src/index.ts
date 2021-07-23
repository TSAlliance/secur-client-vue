import { SecurGuardConfig, SecurRouteGuard } from "./securGuard";
import { SecurStore } from "./securStore";
import { VueSecurClient } from "./securClient";
import { SecurClient, SecurMember, SecurRole } from "@tsalliance/secur-node";
import { SecurConfig } from "@tsalliance/secur-node/lib/securClient";
import store from "./store";

export abstract class VueSecurConfig implements SecurConfig {
  protocol: string;
  host: string;
  port: number;
  path?: string;
  guardConfig: SecurGuardConfig;
}

export default {
  install: (app, config: VueSecurConfig) => {
    if (!config) {
      throw new Error("Missing config when initializing SecurPlugin.");
    }

    SecurClient.init(config);

    if (!app.config.globalProperties.$store) {
      console.warn(
        "VueSecur did not found vuex store on vue instance. This may cause reduced functionality."
      );
      return;
    } else {
      app.config.globalProperties.$store.registerModule("secur", store);
    }

    if (!app.config.globalProperties.$router) {
      console.warn(
        "VueSecur did not found vue-router on vue instance. This may cause reduced functionality."
      );
      return;
    } else {
      SecurRouteGuard.initRouteGuards(
        app.config.globalProperties.$router,
        config.guardConfig
      );
    }
  },
};

export { VueSecurClient, SecurMember, SecurRole, SecurStore };
