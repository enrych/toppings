import { StatusError } from "itty-router";
import {
  HTTP_HEADER,
  HTTP_STATUS,
  MIME_TYPE,
} from "toppings-constants";

export default class ResponseEntity {
  static ok<T>(body: T): Response {
    return new Response(JSON.stringify(body), {
      status: HTTP_STATUS.OK,
      headers: { [HTTP_HEADER.CONTENT_TYPE]: MIME_TYPE.JSON },
    });
  }

  static created<T>(body: T): Response {
    return new Response(JSON.stringify(body), {
      status: HTTP_STATUS.CREATED,
      headers: { [HTTP_HEADER.CONTENT_TYPE]: MIME_TYPE.JSON },
    });
  }

  static badRequest(
    message: ConstructorParameters<typeof StatusError>[1],
  ): Response {
    throw new StatusError(400, message);
  }
}
