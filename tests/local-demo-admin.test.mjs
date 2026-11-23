import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { isLocalDemoAdmin, localDemoAdminAvailable, localDemoAdminId, localDemoAdminUser } from "../src/lib/local-demo-admin.js";

test("demo administrator is limited to virtual development with an explicitly bound local address", (context) => {
  const password = "local-test-value";
  const settings = {
    NODE_ENV: "development", DB_MODE: "virtual",
    __NEXT_PRIVATE_ORIGIN: "http://127.0.0.1:3100",
    LOCAL_DEMO_ADMIN_PASSWORD_HASH: createHash("sha256").update(password).digest("hex"),
  };
  const previous = Object.fromEntries(Object.keys(settings).map((key) => [key, process.env[key]]));
  Object.assign(process.env, settings);
  context.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const request = (host) => new Request("http://127.0.0.1:3100", { headers: { host } });
  const local = request("127.0.0.1:3100");
  const user = localDemoAdminUser(password);
  assert.equal(user.id, localDemoAdminId);
  assert.equal(isLocalDemoAdmin(local, user), true);
  assert.equal(isLocalDemoAdmin(local, { ...user, id: "customer" }), false);
  assert.throws(() => localDemoAdminUser("wrong"));
  assert.equal(localDemoAdminAvailable(request("example.test:3100")), false);

  process.env.DB_MODE = "real";
  assert.equal(isLocalDemoAdmin(local, user), false);
  process.env.DB_MODE = "virtual";
  process.env.NODE_ENV = "production";
  assert.equal(isLocalDemoAdmin(local, user), false);
  process.env.NODE_ENV = "development";
  process.env.__NEXT_PRIVATE_ORIGIN = "http://localhost:3100";
  assert.equal(isLocalDemoAdmin(local, user), false);
});
