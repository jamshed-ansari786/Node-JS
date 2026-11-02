const test = require("node:test");
const assert = require("node:assert/strict");

const {
  checkForAuthenticationCookie,
} = require("../middleware/authentication");
const { createTokenForUser } = require("../services/authentication");
const router = require("../routes/user");

test("authentication middleware accepts a valid token without throwing", () => {
  const token = createTokenForUser({
    _id: "123",
    email: "user@example.com",
    profileImageURL: "/images/default.png",
    role: "USER",
  });

  const req = { cookies: { token } };
  let nextCalled = false;

  assert.doesNotThrow(() => {
    checkForAuthenticationCookie("token")(req, {}, () => {
      nextCalled = true;
    });
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.email, "user@example.com");
});

test("router exposes a logout route at /logout", () => {
  const hasLogoutRoute = router.stack.some(
    (layer) => layer.route && layer.route.path === "/logout",
  );

  assert.equal(hasLogoutRoute, true);
});
