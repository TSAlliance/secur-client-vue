import { SecurMember } from "secur-node";
import { createStore } from "vuex";

export default createStore({
  state: {
    member: undefined as SecurMember,
    ready: false as boolean,
  },
});
