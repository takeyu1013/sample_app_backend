import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifySensible from "fastify-sensible";
import cors from "fastify-cors";
import { Static, Type } from "@sinclair/typebox";

const prisma = new PrismaClient();
export const app = fastify().register(cors);
app.register(fastifySensible);

app.get("/users", async (_, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

app.get("/", async (_, res) => {
  res.send("Hello World");
});

const User = Type.Object({
  name: Type.String({ maxLength: 50 }),
  email: Type.String({ format: "email", maxLength: 255 }),
});
export type Body = Static<typeof User>;

app.post<{
  Body: Body;
  Reply: Body;
}>(
  "/users",
  {
    schema: {
      body: User,
      response: {
        201: User,
      },
    },
  },
  async (req, res) => {
    const { name, email } = req.body;
    if (!name.trim()) {
      throw app.httpErrors.badRequest("The name is empty");
    }
    const lowerEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (user) {
      throw app.httpErrors.conflict(`${lowerEmail} is already exists`);
    }
    const result = await prisma.user.create({
      data: {
        name,
        email: lowerEmail,
      },
    });
    console.log(result);
    res.status(201).send(result);
  }
);

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
