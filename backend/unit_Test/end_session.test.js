const request = require("supertest");
const express = require("express");
const sessionMemory = require("../memory/sessionMemory");
const endSessionRoute = require("../routes/end_session");

const app = express();
app.use(express.json());
app.use("/end-session", endSessionRoute);

describe("End Session Route", () => {
  beforeEach(() => {
    // Clear memory
    for (const key in sessionMemory) delete sessionMemory[key];
  });

  test("returns 400 if sessionId missing", async () => {
    const res = await request(app).post("/end-session").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Missing sessionId");
  });

  test("removes session from memory", async () => {
    sessionMemory["test-session"] = { messages: [] };
    
    const res = await request(app)
      .post("/end-session")
      .send({ sessionId: "test-session" });

    expect(res.statusCode).toBe(200);
    expect(sessionMemory["test-session"]).toBeUndefined();
  });

  test("returns success even if session does not exist", async () => {
    const res = await request(app)
      .post("/end-session")
      .send({ sessionId: "non-existent" });

    expect(res.statusCode).toBe(200);
  });
});
