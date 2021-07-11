import { SecurMember } from "@tsalliance/secur-node";
import { createStore } from "vuex";

export default createStore({
  state: {
    member: undefined as SecurMember,
    ready: false as boolean,
  },
});
