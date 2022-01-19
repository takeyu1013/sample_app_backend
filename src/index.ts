import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifySensible from "fastify-sensible";
import cors from "fastify-cors";
import { Static, Type } from "@sinclair/typebox";
import { fastifyBcrypt } from "fastify-bcrypt";
import { Body, bodySchema, createUser } from "./user";
import { fastifyJwt } from "fastify-jwt";

export const app = fastify()
  .register(cors)
  .register(fastifySensible)
  .register(fastifyBcrypt)
  .register(fastifyJwt, {
    secret: "secret",
  });
const prisma = new PrismaClient();

app.get("/", async (_, res) => {
  res.send("Hello World");
});

const responseSchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String(),
});
type Response = Static<typeof responseSchema>;

app.get<{ Reply: Response[] }>(
  "/users",
  {
    schema: {
      response: {
        200: Type.Array(responseSchema),
      },
    },
  },
  async (_, res) => {
    const users = await prisma.user.findMany();
    res.send(users);
  }
);

app.post<{ Body: Body; Reply: Response }>(
  "/users",
  {
    schema: {
      body: bodySchema,
      response: {
        201: responseSchema,
      },
    },
  },
  async (req, res) => {
    const user = await createUser(req.body);
    const result = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordDigest: await app.bcrypt.hash(user.password),
      },
    });
    res.log.info(result);
    res.status(201).send(result);
  }
);

const authSchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

type Auth = Static<typeof authSchema>;

app.post<{ Body: Auth }>("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).send({ error: "Invalid email or password" });
  }

  if (!(await app.bcrypt.compare(password, user.passwordDigest))) {
    return res.status(401).send({ error: "Invalid email or password" });
  }

  let { passwordDigest: pass, ...data } = user;
  return res.send({
    data: { user: data, accessToken: app.jwt.sign(data) },
  });
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
