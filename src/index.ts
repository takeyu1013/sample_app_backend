import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifySensible from "fastify-sensible";
import cors from "fastify-cors";
import { Static, Type } from "@sinclair/typebox";
import { Body, bodySchema, createUser, randomString } from "./user";
import { fastifyJwt } from "fastify-jwt";
import { hashSync, compareSync } from "bcrypt";

export const app = fastify()
  .register(cors)
  .register(fastifySensible)
  .register(fastifyJwt, {
    secret: "secret",
  });
const prisma = new PrismaClient();

app.get(
  "/",
  {
    schema: {
      response: {
        200: Type.String(),
      },
    },
  },
  async (_, relpy) => {
    return relpy.send("Hello World");
  }
);

const userReplySchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  email: Type.String(),
});
type userReply = Static<typeof userReplySchema>;

app.get<{ Reply: userReply[] }>(
  "/users",
  {
    schema: {
      response: {
        200: Type.Array(userReplySchema),
      },
    },
  },
  async (_, reply) => {
    const users = await prisma.user.findMany();
    return reply.send(users);
  }
);

app.post<{ Body: Body; Reply: userReply }>(
  "/users",
  {
    schema: {
      body: bodySchema,
      response: {
        201: userReplySchema,
      },
    },
  },
  async (request, reply) => {
    try {
      const user = await createUser(request.body);
      const result = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          passwordDigest: hashSync(user.password, 10),
          rememberDigest: randomString(),
        },
      });
      return reply.status(201).send(result);
    } catch (error: unknown) {
      return reply.badRequest();
    }
  }
);

const loginBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

type LoginBody = Static<typeof loginBodySchema>;

const loginReplySchema = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  token: Type.String(),
});

type LoginReply = Static<typeof loginReplySchema>;

app.post<{ Body: LoginBody; Reply: LoginReply }>(
  "/login",
  {
    schema: {
      body: loginBodySchema,
      response: {
        201: loginReplySchema,
      },
    },
  },
  async (request, reply) => {
    const { email, password } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !compareSync(password, user.passwordDigest)) {
      return reply.unauthorized();
    }
    const { id, name, passwordDigest: digest, ...data } = user;
    const token = app.jwt.sign(data);
    return reply.status(200).send({ id, name, token });
  }
);

const userParamsSchema = Type.Object({
  id: Type.Number(),
});

type userParams = Static<typeof userParamsSchema>;

app.get<{ Params: userParams; Reply: userReply }>(
  "/users/:id",
  {
    schema: {
      params: userParamsSchema,
      response: {
        200: userReplySchema,
      },
    },
  },
  async (request, reply) => {
    const verifeid = await request.jwtVerify();
    if (!verifeid) {
      return reply.unauthorized();
    }
    const { id } = request.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      return reply.send(user);
    }
    return reply.notFound();
  }
);

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || "0.0.0.0";
app.listen(port, address, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`
  🚀 Server ready at: http://localhost:${port}
  ⭐️ See sample requests: http://pris.ly/e/ts/rest-fastify#3-using-the-rest-api`);
});
