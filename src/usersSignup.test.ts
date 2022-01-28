import { PrismaClient } from "@prisma/client";
import { app } from "./index";
import { Body } from "./user";

test("invalid signup information", async () => {
  const prisma = new PrismaClient();
  const count = await prisma.user.count();
  const user: Body = {
    name: "Foo Bar",
    email: "foo@invalid",
    password: "dude",
    passwordConfirmation: "dude",
  };
  await app.inject({
    method: "POST",
    url: "/signup",
    payload: user,
  });
  expect(await prisma.user.count()).toStrictEqual(count);
});
