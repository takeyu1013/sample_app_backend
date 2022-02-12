import { PrismaClient, Prisma } from "@prisma/client";
import { hashSync } from "bcrypt";
import { createUser } from "../src/user";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Example User",
    email: "example@railstutorial.org",
    passwordDigest: "foobar",
    rememberDigest: "",
  },
  {
    name: "Nilu",
    email: "nilu@prisma.io",
    passwordDigest: "foobar",
    rememberDigest: "",
  },
  {
    name: "Mahmoud",
    email: "mahmoud@prisma.io",
    passwordDigest: "foobar",
    rememberDigest: "",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await createUser({
      name: u.name,
      email: u.email,
      password: u.passwordDigest,
      passwordConfirmation: u.passwordDigest,
    });
    const result = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordDigest: hashSync(user.password, 10),
        rememberDigest: u.rememberDigest,
      },
    });
    console.log(result);
  }
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
