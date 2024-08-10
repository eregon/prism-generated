import test from "node:test";
import assert from "node:assert";
import { loadPrism } from "./src/index.js";
import * as nodes from "./src/nodes.js";

const parse = await loadPrism();

test("node", () => {
  const result = parse("foo");
  assert(result.value instanceof nodes.ProgramNode);
});

test("node? present", () => {
  const result = parse("foo.bar");
  assert(result.value.statements.body[0].receiver instanceof nodes.CallNode);
});

test("node? absent", () => {
  const result = parse("foo");
  assert(result.value.statements.body[0].receiver === null);
});

test("node[]", () => {
  const result = parse("foo.bar");
  assert(result.value.statements.body instanceof Array);
});

test("string", () => {
  const result = parse('"foo"');
  assert(result.value.statements.body[0].unescaped === "foo");
});

test("constant", () => {
  const result = parse("foo = 1");
  assert(result.value.locals[0] === "foo");
});

test("constant? present", () => {
  const result = parse("def foo(*bar); end");
  assert(result.value.statements.body[0].parameters.rest.name === "bar");
});

test("constant? absent", () => {
  const result = parse("def foo(*); end");
  assert(result.value.statements.body[0].parameters.rest.name === null);
});

test("constant[]", async() => {
  const result = parse("foo = 1");
  assert(result.value.locals instanceof Array);
});

test("location", () => {
  const result = parse("foo = 1");
  assert(typeof result.value.location.startOffset === "number");
});

test("location? present", () => {
  const result = parse("def foo = bar");
  assert(result.value.statements.body[0].equalLoc !== null);
});

test("location? absent", () => {
  const result = parse("def foo; bar; end");
  assert(result.value.statements.body[0].equalLoc === null);
});

test("uint8", () => {
  const result = parse("-> { _3 }");
  assert(result.value.statements.body[0].parameters.maximum === 3);
});

test("uint32", () => {
  const result = parse("foo = 1");
  assert(result.value.statements.body[0].depth === 0);
});

test("flags", () => {
  const result = parse("/foo/mi");
  const regexp = result.value.statements.body[0];

  assert(regexp.isIgnoreCase());
  assert(regexp.isMultiLine());
  assert(!regexp.isExtended());
});

test("integer (decimal)", () => {
  const result = parse("10");
  assert(result.value.statements.body[0].value == 10);
});

test("integer (hex)", () => {
  const result = parse("0xA");
  assert(result.value.statements.body[0].value == 10);
});

test("integer (2 nodes)", () => {
  const result = parse("4294967296");
  assert(result.value.statements.body[0].value == 4294967296n);
});

test("integer (3 nodes)", () => {
  const result = parse("18446744073709552000");
  assert(result.value.statements.body[0].value == 18446744073709552000n);
});

test("double", () => {
  const result = parse("1.0");
  assert(result.value.statements.body[0].value == 1.0);
});
