import { v4 as uuidv4 } from "uuid";

export class SecurCookieManager {
  public static get(cookieName: string): string {
    if (!this.exists(cookieName)) return null;

    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(cookieName + "="))
      .split("=")[1];
  }

  public static exists(cookieName: string): boolean {
    if (!window) return false;
    return !!document.cookie
      .split(";")
      .some((item) => item.trim().startsWith(cookieName + "="));
  }

  public static setWithRandomValue(data: SecurCookieRandom) {
    this.set({ ...data, value: uuidv4() });
  }

  public static set(data: SecurCookie) {
    let cookie = data.name + "=" + data.value;

    if (data.expires) cookie += "; expires=" + data.expires.toString();
    if (data.path) cookie += "; path=" + data.path;
    if (data.domain) cookie += "; domain=" + data.domain;
    if (data.maxAgeSeconds) cookie += "; max-age=" + data.maxAgeSeconds;
    if (data.sameSite) cookie += "; sameSite=" + data.sameSite;
    if (data.secure) cookie += "; secure=" + data.secure;

    document.cookie = cookie;
  }

  public static remove(cookieName: string) {
    this.set({
      name: cookieName,
      value: undefined,
      expires: new Date(0),
    });
  }
}

export interface SecurCookieRandom {
  name: string;
  path?: string;
  expires?: Date;
  secure?: boolean;
  sameSite?: string;
  domain?: string;
  maxAgeSeconds?: number;
}

export interface SecurCookie extends SecurCookieRandom {
  value: string;
}
