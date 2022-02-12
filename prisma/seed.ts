import { PrismaClient, Prisma } from "@prisma/client";
import { hashSync } from "bcrypt";
import { randomString } from "../src/randomString";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Example User",
    email: "example@railstutorial.org",
    passwordDigest: "foobar",
    rememberDigest: randomString(),
  },
  {
    name: "Nilu",
    email: "nilu@prisma.io",
    passwordDigest: "foobar",
    rememberDigest: randomString(),
  },
  {
    name: "Mahmoud",
    email: "mahmoud@prisma.io",
    passwordDigest: "foobar",
    rememberDigest: randomString(),
  },
];

async function main() {
  console.log(`Start seeding ...`);
  userData.forEach(async (user) => {
    console.log("remember_url", user.rememberDigest);
    const result = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordDigest: hashSync(user.passwordDigest, 10),
        rememberDigest: hashSync(user.rememberDigest, 10),
      },
    });
    console.log(result);
  });
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
