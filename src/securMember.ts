import { SecurStore } from "./securStore";
import { SecurMember } from "@tsalliance/secur-node";

export class SecurMemberCached {
  public member: SecurMember;

  constructor(member: SecurMember) {
    this.member = member;
  }

  public isExpired(): boolean {
    return SecurStore.existsSecurVerifyToken();
  }
}
