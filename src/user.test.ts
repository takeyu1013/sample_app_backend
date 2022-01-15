import { PrismaClient, User } from "@prisma/client";

import type { Body } from "./index";
import { app } from "./index";

describe("user tests", () => {
  const prisma = new PrismaClient();
  beforeEach(() => {
    return prisma.user.deleteMany();
  });

  const defaultUser: Body = {
    name: "Example User",
    email: "user@example.com",
  };

  test("should be vaild", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: defaultUser,
    });
    expect(response.statusCode).toBe(201);
  });

  test("name should be present", async () => {
    const user = { ...defaultUser, name: "" };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.statusCode).toBe(400);
  });

  test("email should be present", async () => {
    const user = { ...defaultUser, email: "     " };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.statusCode).toBe(400);
  });

  test("name should not be too long", async () => {
    const user = { ...defaultUser, name: "a".repeat(51) };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.statusCode).toBe(400);
  });

  test("email should not be too long", async () => {
    const user = { ...defaultUser, email: "a".repeat(244) + "@example.com" };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.statusCode).toBe(400);
  });

  test("email validation should reject invalid addresses", async () => {
    const invaildAddresses = [
      "user@example,com",
      "user_at_foo.org",
      "user.name@example.foo@bar_baz.com",
      "foo@bar+baz.com",
    ];
    invaildAddresses.map(async (email) => {
      const user = { ...defaultUser, email };
      const response = await app.inject({
        method: "POST",
        url: "/users",
        payload: user,
      });
      expect(response.statusCode).toBe(400);
    });
  });

  test("email addresses should be unique", async () => {
    await app.inject({
      method: "POST",
      url: "/users",
      payload: defaultUser,
    });
    const user = { ...defaultUser, email: defaultUser.email.toUpperCase() };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.statusCode).toBe(409);
  });

  test("email addresses should be saved as lower-case", async () => {
    const mixedCaseEmail = "Foo@ExAMPle.CoM";
    const user = { ...defaultUser, email: mixedCaseEmail };
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: user,
    });
    expect(response.json<User>().email).toBe(mixedCaseEmail.toLowerCase());
  });

  afterAll((done) => {
    app.close();
    done();
  });
});
