export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
} as const;

export const HTTP_METHOD = {
  GET: "GET",
} as const;

export const HTTP_ACCEPT = {
  JSON: "application/json",
} as const;

export const HTTP_HEADER = {
  CONTENT_TYPE: "Content-Type",
  ACCEPT: "Accept",
} as const;

export const MIME_TYPE = {
  JSON: "application/json",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;
