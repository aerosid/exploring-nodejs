import { describe, it, test } from "node:test";
import { strict as assert } from "node:assert";
import "dotenv/config";
import Greeting from "./Greeting.mjs";

test("synchronous passing test", () => {
  const value = "Howdy!";
  const greeting = Greeting.build().greeting(value).toString();
  assert.strictEqual(greeting, value);
});

describe("sample test", () => {
  it("should work", () => {
    const value = "Howdy!";
    const greeting = Greeting.build().greeting(value).toString();
    assert.strictEqual(greeting, value);
  });
});

test("dotenv test", () => {
  const value = "Howdy!";
  const greeting = process.env.GREETING;
  assert.strictEqual(greeting, value);
});