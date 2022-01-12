import { PrismaClient } from "@prisma/client";

test("should be vaild", async () => {
  const prisma = new PrismaClient();
  const user = {
    name: "Rich",
    email: "hello@prisma.io",
  };
  const response = await prisma.user.create({ data: user });
  await prisma.user.delete({
    where: {
      id: response.id,
    },
  });

  await expect(response).resolves.toBeTruthy;
});
