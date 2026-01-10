// @ts-nocheck
import request from "supertest";
import app from "../../src/app";

const allowedOrigin = "http://localhost:5173";
const disallowedOrigin = "http://malicious.local";

describe("CORS middleware", () => {
  it("permite la preflight para orígenes conocidos", async () => {
    const response = await request(app)
      .options("/api/chat")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
  });

  it("bloquea orígenes no listados", async () => {
    const response = await request(app)
      .options("/api/chat")
      .set("Origin", disallowedOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
