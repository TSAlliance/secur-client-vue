import { ApiError } from "alliance-client-lib/lib/error";
import {
  SecurAccountNotFoundError,
  SecurInvalidSessionError,
} from "./securError";

export interface SecurErrorHandler {
  handleAccountNotFound?(error: SecurAccountNotFoundError);
  handleSessionExpired?(error: SecurInvalidSessionError);
  handleError?(error: ApiError);
}
