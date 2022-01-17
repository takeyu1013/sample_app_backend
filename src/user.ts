import { PrismaClient } from "@prisma/client";
import { Static, Type } from "@sinclair/typebox";
import addFormats from "ajv-formats";
import Ajv from "ajv/dist/2019";

export const bodySchema = Type.Object({
  name: Type.String({ maxLength: 50 }),
  email: Type.String({ format: "email", maxLength: 255 }),
  password: Type.String({ minLength: 6 }),
  passwordConfirmation: Type.String({ minLength: 6 }),
});
export type Body = Static<typeof bodySchema>;

export const createUser = async (user: Body): Promise<Body> => {
  const prisma = new PrismaClient();
  const result = await prisma.user.findUnique({ where: { email: user.email } });
  if (result) {
    throw new Error("The email is already exist");
  }
  if (!user.name.trim()) {
    throw new Error("The name is empty");
  }
  if (!user.password.trim()) {
    throw new Error("The password is empty");
  }
  const ajv = addFormats(new Ajv({}), [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
  ])
    .addKeyword("kind")
    .addKeyword("modifier");
  const validate = ajv.validate(bodySchema, user);
  if (!validate) {
    throw new Error("The user is invalid");
  }
  return user;
};
