import { PrismaClient } from "@prisma/client";
import type { Body } from "./user";
import { createUser } from "./user";

describe("user tests", () => {
  const prisma = new PrismaClient();
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });
  const user: Body = {
    name: "Example User",
    email: "user@example.com",
    password: "foobar",
    passwordConfirmation: "foobar",
  };

  test("should be vaild", async () => {
    expect(await createUser(user)).toBeTruthy();
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
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordDigest: user.password,
      },
    });
    expect(() => createUser(user)).rejects.toThrowError();
  });
});
