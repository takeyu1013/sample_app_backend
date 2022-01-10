import { app } from "./index";

test("should be vaild", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/users",
  });
  expect(response.statusCode).toBe(200);
});
