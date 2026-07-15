import assert from "node:assert/strict";
import test from "node:test";
import { getLoginErrorMessage, loginErrorMessages } from "../src/lib/auth/login-errors.ts";
import { validateLoginCredentials } from "../src/lib/auth/login-validation.ts";
import {
  forgetRememberedEmail,
  readRememberedEmail,
  rememberEmail,
} from "../src/lib/auth/remembered-email.ts";

test("login validation reports required fields", () => {
  assert.deepEqual(validateLoginCredentials({ email: "", password: "" }), {
    email: "Email is required.",
    password: "Password is required.",
  });
});

test("login validation rejects malformed email without weakening valid credentials", () => {
  assert.deepEqual(validateLoginCredentials({ email: "not-an-email", password: "secret" }), {
    email: "Enter a valid email address.",
  });
  assert.deepEqual(
    validateLoginCredentials({ email: " admin@example.com ", password: "secret" }),
    {},
  );
});

test("authentication responses map to safe, distinct messages", () => {
  assert.equal(getLoginErrorMessage(401), loginErrorMessages.invalidCredentials);
  assert.equal(getLoginErrorMessage(429), loginErrorMessages.rateLimited);
  assert.equal(getLoginErrorMessage(503), loginErrorMessages.serviceUnavailable);
  assert.equal(getLoginErrorMessage(500), loginErrorMessages.unexpected);
});

test("remember email stores only a normalized email under one scoped key", () => {
  const storage = createStorage();

  rememberEmail(" admin@example.com ", storage);

  assert.equal(readRememberedEmail(storage), "admin@example.com");
  assert.equal(storage.values.size, 1);
  assert.equal([...storage.values.values()][0], "admin@example.com");

  forgetRememberedEmail(storage);
  assert.equal(readRememberedEmail(storage), "");
  assert.equal(storage.values.size, 0);
});

function createStorage() {
  const values = new Map();
  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
