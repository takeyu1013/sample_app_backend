import { randomBytes } from "crypto";

export const randomString = () => {
  return randomBytes(16).toString("base64url");
};
