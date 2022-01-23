import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Example User",
    email: "example@railstutorial.org",
    passwordDigest: "foobar",
  },
  {
    name: "Nilu",
    email: "nilu@prisma.io",
    passwordDigest: "foo",
  },
  {
    name: "Mahmoud",
    email: "mahmoud@prisma.io",
    passwordDigest: "bar",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
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
