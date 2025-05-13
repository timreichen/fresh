export type Method = "HEAD" | "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface Route<T> {
  path: string | URLPattern;
  method: Method | "ALL";
  handlers: T[];
}

export interface RouteResult<T> {
  params: Record<string, string>;
  handlers: T[][];
  methodMatch: boolean;
  patternMatch: boolean;
  pattern: string | null;
}

export interface Router<T> {
  _routes: Route<T>[];
  _middlewares: T[];
  addMiddleware(fn: T): void;
  add(
    method: Method | "ALL",
    pathname: string | URLPattern,
    handlers: T[],
  ): void;
  match(method: Method, url: URL): RouteResult<T>;
}

export const IS_PATTERN = /[*:{}+?()]/;

export class UrlPatternRouter<T> implements Router<T> {
  readonly _routes: Route<T>[] = [];
  readonly _middlewares: T[] = [];

  addMiddleware(fn: T): void {
    this._middlewares.push(fn);
  }

  add(method: Method | "ALL", pathname: string | URLPattern, handlers: T[]) {
    if (
      typeof pathname === "string" && pathname !== "/*" &&
      IS_PATTERN.test(pathname)
    ) {
      this._routes.push({
        path: new URLPattern({ pathname }),
        handlers,
        method,
      });
    } else {
      this._routes.push({
        path: pathname,
        handlers,
        method,
      });
    }
  }

  match(method: Method, url: URL): RouteResult<T> {
    const result: RouteResult<T> = {
      params: {},
      handlers: [],
      methodMatch: false,
      patternMatch: false,
      pattern: null,
    };

    if (this._middlewares.length > 0) {
      result.handlers.push(this._middlewares);
    }

    for (let i = 0; i < this._routes.length; i++) {
      const route = this._routes[i];

      // Fast path for string based routes which are expected
      // to be either wildcard `*` match or an exact pathname match.
      if (
        typeof route.path === "string" &&
        (route.path === "/*" || route.path === url.pathname)
      ) {
        if (route.method !== "ALL") result.patternMatch = true;
        result.pattern = route.path;

        if (route.method === "ALL" || route.method === method) {
          result.handlers.push(route.handlers);

          if (route.path === "/*" && route.method === "ALL") {
            continue;
          }

          result.methodMatch = true;

          return result;
        }
      } else if (route.path instanceof URLPattern) {
        const match = route.path.exec(url);
        if (match !== null) {
          if (route.method !== "ALL") result.patternMatch = true;
          result.pattern = route.path.pathname;

          if (route.method === "ALL" || route.method === method) {
            result.handlers.push(route.handlers);

            // Decode matched params
            for (const [key, value] of Object.entries(match.pathname.groups)) {
              result.params[key] = value === undefined ? "" : decodeURI(value);
            }

            if (route.method === "ALL") {
              continue;
            }

            result.methodMatch = true;
            return result;
          }
        }
      }
    }

    return result;
  }
}
