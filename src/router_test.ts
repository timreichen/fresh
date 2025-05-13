import { expect } from "@std/expect";
import { IS_PATTERN, UrlPatternRouter } from "./router.ts";

Deno.test("IS_PATTERN", () => {
  expect(IS_PATTERN.test("/foo")).toEqual(false);
  expect(IS_PATTERN.test("/foo/bar/baz.jpg")).toEqual(false);
  expect(IS_PATTERN.test("/foo/:path")).toEqual(true);
  expect(IS_PATTERN.test("/foo/*")).toEqual(true);
  expect(IS_PATTERN.test("/foo{/bar}?")).toEqual(true);
  expect(IS_PATTERN.test("/foo/(\\d+)")).toEqual(true);
  expect(IS_PATTERN.test("/foo/(a)")).toEqual(true);
});

Deno.test("UrlPatternRouter - GET get first match", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  const B = () => {};
  const C = () => {};
  router.add("GET", "/", [A]);
  router.add("GET", "/", [B]);
  router.add("GET", "/", [C]);

  const res = router.match("GET", new URL("/", "http://localhost"));
  expect(res).toEqual({
    params: {},
    handlers: [[A]],
    methodMatch: true,
    pattern: "/",
    patternMatch: true,
  });
});

Deno.test("UrlPatternRouter - GET get matches with middlewares", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  const B = () => {};
  const C = () => {};
  router.add("ALL", "/*", [A]);
  router.add("ALL", "/*", [B]);
  router.add("GET", "/", [C]);

  const res = router.match("GET", new URL("/", "http://localhost"));
  expect(res).toEqual({
    params: {},
    handlers: [[A], [B], [C]],
    methodMatch: true,
    pattern: "/",
    patternMatch: true,
  });
});

Deno.test("UrlPatternRouter - GET extract params", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  router.add("GET", new URLPattern({ pathname: "/:foo/:bar/c" }), [A]);

  let res = router.match("GET", new URL("/a/b/c", "http://localhost"));
  expect(res).toEqual({
    params: { foo: "a", bar: "b" },
    handlers: [[A]],
    methodMatch: true,
    pattern: "/:foo/:bar/c",
    patternMatch: true,
  });

  // Decode params
  res = router.match("GET", new URL("/a%20a/b/c", "http://localhost"));
  expect(res).toEqual({
    params: { foo: "a a", bar: "b" },
    handlers: [[A]],
    methodMatch: true,
    pattern: "/:foo/:bar/c",
    patternMatch: true,
  });
});

Deno.test("UrlPatternRouter - Wrong method match", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  router.add("GET", "/foo", [A]);

  const res = router.match("POST", new URL("/foo", "http://localhost"));
  expect(res).toEqual({
    params: {},
    handlers: [],
    methodMatch: false,
    pattern: "/foo",
    patternMatch: true,
  });
});

Deno.test("UrlPatternRouter - wrong + correct method", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  const B = () => {};
  router.add("GET", "/foo", [A]);
  router.add("POST", "/foo", [B]);

  const res = router.match("POST", new URL("/foo", "http://localhost"));
  expect(res).toEqual({
    params: {},
    handlers: [[B]],
    methodMatch: true,
    pattern: "/foo",
    patternMatch: true,
  });
});

Deno.test("UrlPatternRouter - convert patterns automatically", () => {
  const router = new UrlPatternRouter();
  const A = () => {};
  router.add("GET", "/books/:id", [A]);

  const res = router.match("GET", new URL("/books/foo", "http://localhost"));
  expect(res).toEqual({
    params: {
      id: "foo",
    },
    handlers: [[A]],
    methodMatch: true,
    pattern: "/books/:id",
    patternMatch: true,
  });
});
