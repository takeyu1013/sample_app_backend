import { PrismaClient } from "@prisma/client";
import type { Body } from "./user";
import { createUser } from "./user";

describe("user tests", () => {
  const prisma = new PrismaClient();
  const user: Body = {
    name: "Example User",
    email: "user@example.com",
    password: "foobar",
    passwordConfirmation: "foobar",
  };

  test("should be vaild", async () => {
    expect(await createUser(user)).toEqual(user);
  });

  test("name should be present", async () => {
    expect(() => createUser({ ...user, name: "" })).rejects.toThrowError();
  });

  test("email should be present", async () => {
    expect(() =>
      createUser({ ...user, email: "     " })
    ).rejects.toThrowError();
  });

  test("name should not be too long", async () => {
    expect(() =>
      createUser({ ...user, name: "a".repeat(51) })
    ).rejects.toThrowError();
  });

  test("email should not be too long", async () => {
    expect(() =>
      createUser({ ...user, email: "a".repeat(244) + "@example.com" })
    ).rejects.toThrowError();
  });

  test("email addresses should be unique", async () => {
    const result = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordDigest: user.password,
      },
    });
    await expect(() => createUser(user)).rejects.toThrowError();
    await prisma.user.delete({ where: { email: result.email } });
  });

  test("password should be present (nonblank)", async () => {
    const password = " ".repeat(6);
    expect(() =>
      createUser({ ...user, password, passwordConfirmation: password })
    ).rejects.toThrowError();
  });

  test("password should have a minimum length", async () => {
    const password = "a".repeat(5);
    expect(() =>
      createUser({ ...user, password, passwordConfirmation: password })
    ).rejects.toThrowError();
  });
});
