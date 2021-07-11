import { ApiError } from "@tsalliance/sdk";
import {
  SecurAccountNotFoundError,
  SecurInvalidSessionError,
} from "secur-node";

export interface SecurErrorHandler {
  handleAccountNotFound?(error: SecurAccountNotFoundError);
  handleSessionExpired?(error: SecurInvalidSessionError);
  handleError?(error: ApiError);
}
