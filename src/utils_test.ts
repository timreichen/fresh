import { expect } from "@std/expect";
import { mergePaths, pathToPattern } from "./utils.ts";

Deno.test("mergePaths", () => {
  expect(mergePaths("", "")).toEqual("");
  expect(mergePaths("/", "/foo")).toEqual("/foo");
  expect(mergePaths("/*", "/foo")).toEqual("/foo");
  expect(mergePaths("/foo/bar", "/baz")).toEqual("/foo/bar/baz");
  expect(mergePaths("/foo/bar/", "/baz")).toEqual("/foo/bar/baz");
  expect(mergePaths("/foo/bar", "baz")).toEqual("/foo/bar/baz");
});

Deno.test("pathToPattern", async (t) => {
  await t.step("creates pattern", () => {
    expect(pathToPattern("foo/bar")).toEqual("/foo/bar");
  });

  await t.step("parses index routes", () => {
    expect(pathToPattern("foo/index")).toEqual("/foo");
  });

  await t.step("parses parameters", () => {
    expect(pathToPattern("foo/[name]")).toEqual("/foo/:name");
    expect(pathToPattern("foo/[name]/bar/[bob]")).toEqual(
      "/foo/:name/bar/:bob",
    );
  });

  await t.step("parses catchall", () => {
    expect(pathToPattern("foo/[...name]")).toEqual("/foo/:name*");
  });

  await t.step("parses multiple params in same part", () => {
    expect(pathToPattern("foo/[mod]@[version]")).toEqual("/foo/:mod@:version");
    expect(pathToPattern("foo/[bar].json")).toEqual("/foo/:bar.json");
    expect(pathToPattern("foo/foo[bar]")).toEqual("/foo/foo:bar");
  });

  await t.step("parses optional params", () => {
    expect(pathToPattern("foo/[[name]]")).toEqual("/foo{/:name}?");
    expect(pathToPattern("foo/[name]/[[bob]]")).toEqual("/foo/:name{/:bob}?");
    expect(pathToPattern("foo/[[name]]/bar")).toEqual("/foo{/:name}?/bar");
    expect(
      pathToPattern("foo/[[name]]/bar/[[bob]]"),
    ).toEqual(
      "/foo{/:name}?/bar{/:bob}?",
    );
  });

  await t.step("throws on invalid patterns", () => {
    expect(() => pathToPattern("foo/[foo][bar]")).toThrow();
    expect(() => pathToPattern("foo/foo]")).toThrow();
    expect(() => pathToPattern("foo/[foo]]")).toThrow();
    expect(() => pathToPattern("foo/foo-[[name]]-bar/baz")).toThrow();
    expect(() => pathToPattern("foo/[[name]]-bar/baz")).toThrow();
    expect(() => pathToPattern("foo/foo-[[name]]/baz")).toThrow();
    expect(() => pathToPattern("foo/foo-[[name]]")).toThrow();
    expect(() => pathToPattern("foo/[[name]]-bar")).toThrow();
  });
});
