import { StatusError } from "itty-router";

export default class ResponseEntity {
  static ok<T>(body: T): Response {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  static created<T>(body: T): Response {
    return new Response(JSON.stringify(body), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }

  static badRequest(
    message: ConstructorParameters<typeof StatusError>[1],
  ): Response {
    throw new StatusError(400, message);
  }
}
