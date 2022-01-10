import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import cors from "fastify-cors";

const prisma = new PrismaClient();
export const app = fastify().register(cors);

app.get("/users", async (_, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

app.get("/", async (_, res) => {
  res.send("Hello World");
});

const port = process.env.PORT || 3001;
app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`
  🚀 Server ready at: http://localhost:${port}
  ⭐️ See sample requests: http://pris.ly/e/ts/rest-fastify#3-using-the-rest-api`);
});
