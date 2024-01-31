require("dotenv").config();

const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("./../app");
const User = require("../models/user");

mongoose.set("strictQuery", false);

const { DB_TEST_URI } = process.env;

describe("login", () => {
  beforeAll(async () => {
    await mongoose.connect(DB_TEST_URI);

    await User.deleteMany();

    await supertest(app).post("/api/users/register").send({
      email: "testUser1@gmail.com",
      password: "123456",
    });
  });

  afterAll(async () => {
    await mongoose.disconnect(DB_TEST_URI);
  });

  it("should login successful", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "testUser1@gmail.com",
      password: "123456",
    });

    console.log(response.body.user);

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      email: expect.any(String),
      subscription: expect.any(String),
    });
  });

  it("should not login with wrong password", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      email: "testUser1@gmail.com",
      password: "12345678",
    });

    expect(response.statusCode).toBe(401);
  });
});
