import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import fastifySensible from "fastify-sensible";
import cors from "fastify-cors";
import { Static, Type } from "@sinclair/typebox";
import { fastifyBcrypt } from "fastify-bcrypt";
import { Body, bodySchema, createUser } from "./user";
import { fastifyJwt } from "fastify-jwt";
import { fastifyCookie } from "fastify-cookie";

export const app = fastify()
  .register(cors)
  .register(fastifySensible)
  .register(fastifyBcrypt)
  .register(fastifyJwt, {
    secret: "secret",
  })
  .register(fastifyCookie);

app.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (error: unknown) {
    reply.send(error);
  }
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
    relpy.send("Hello World");
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
    reply.send(users);
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
          passwordDigest: await app.bcrypt.hash(user.password),
        },
      });
      reply.status(201).send(result);
    } catch (error: unknown) {
      reply.badRequest();
    }
  }
);

const loginBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

type LoginBody = Static<typeof loginBodySchema>;

const loginReplySchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
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
    if (!user || !(await app.bcrypt.compare(password, user.passwordDigest))) {
      return reply.unauthorized();
    }
    const { passwordDigest: digest, ...data } = user;
    const token = app.jwt.sign(data);
    reply.setCookie("token", token, {
      path: "/",
      secure: true,
      httpOnly: true,
      sameSite: true,
    });
    return reply.status(200).send({
      name: user.name,
      email,
      token,
    });
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
    const { id } = request.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (user) {
      reply.send(user);
    } else {
      reply.notFound();
    }
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
