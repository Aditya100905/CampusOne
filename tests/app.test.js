import request from "supertest";
import app from "../src/app.js";

describe("CampusOne API", () => {

  test("GET /", async () => {

    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);

    expect(res.body).toBe("Hello, World!");

  });

});