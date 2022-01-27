import { app } from "./index";

test("invalid signup information", async () => {
  const response = await app.inject({
    method: "POST",
    url: "/signup",
    payload: {},
  });
});
