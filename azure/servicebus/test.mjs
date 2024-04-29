import { test } from "node:test";
import { strict as assert } from "node:assert";
import { delay } from "@azure/service-bus";
import Publisher from "./publisher.mjs";
import Subscriber from "./subscriber.mjs";

test("publish-subscribe", async () => {
  const expectedValue = { timestamp: (new Date()).toISOString() };
  let actualValue = { timestamp: "n/a" };
  const pub = Publisher.build().init();
  await pub.post(expectedValue);
  await pub.destroy();

  const sub = Subscriber.build().init();
  const onMessage = async (payload) => {
    actualValue = payload.body;
  };
  const onError = async (error) => {
    console.log(error);
  };
  sub.listen(onMessage, onError);
  await delay(5000); // 5 seconds
  await sub.destroy();

  assert.strictEqual(expectedValue.timestamp, actualValue.timestamp);
});
