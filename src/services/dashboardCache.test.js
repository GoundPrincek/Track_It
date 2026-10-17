import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardCache } from "./dashboardCache.js";

test("dashboard cache isolates users and clears data on logout", () => {
  const cache = createDashboardCache(15000);
  const userA = { expenses: [{ title: "User A private expense" }] };
  const userAIdentity = "user-a:token-a";
  const userBIdentity = "user-b:token-b";

  cache.set(userAIdentity, userA, 1000);

  assert.deepEqual(cache.get(userAIdentity, 2000), userA);
  assert.equal(cache.get(userBIdentity, 2000), undefined);

  const pending = Promise.resolve(userA);
  cache.setRequest(userAIdentity, pending);
  const generationBeforeLogout = cache.generation(userAIdentity);
  cache.clearUser("user-a");

  assert.equal(cache.get(userAIdentity, 2000), undefined);
  assert.equal(cache.getRequest(userAIdentity), undefined);
  assert.notEqual(cache.generation(userAIdentity), generationBeforeLogout);
  assert.equal(cache.get(userBIdentity, 2000), undefined);
});

test("an in-flight request cleared by logout cannot repopulate the cache", () => {
  const cache = createDashboardCache(15000);
  const identity = "user-a:token-a";
  const requestGeneration = cache.generation(identity);

  cache.clear();
  if (cache.generation(identity) === requestGeneration) {
    cache.set(identity, { secret: "stale" });
  }

  assert.equal(cache.get(identity), undefined);
});
