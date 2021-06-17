import { ApiError } from "alliance-client-lib/lib/error";

export class SecurAccountNotFoundError extends ApiError {
  constructor() {
    super("Dein Konto existiert nicht.", 404, "SECUR_ACCOUNT_MISSING");
  }
}

export class SecurInvalidSessionError extends ApiError {
  constructor() {
    super(
      "Deine Sitzung ist ungültig. Bitte melde dich erneut an.",
      403,
      "SECUR_INVALID_SESSION"
    );
  }
}
