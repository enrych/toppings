import {
  BASE_URL,
  HTTP_ACCEPT,
  HTTP_HEADER,
  NODE_ENV,
} from "@toppings/constants";
import { interpolateTemplate } from "@toppings/utils";

function resolveBaseUrl(): string {
  return process.env.NODE_ENV === NODE_ENV.DEVELOPMENT
    ? BASE_URL.LOCAL
    : BASE_URL.PRODUCTION;
}

export const api = {
  url(
    endpointTemplate: string,
    params: Record<string, string | number> = {},
  ): string {
    return `${resolveBaseUrl()}${interpolateTemplate(endpointTemplate, params)}`;
  },

  fetch(
    endpointTemplate: string,
    params: Record<string, string | number> = {},
    init?: RequestInit,
  ): Promise<Response> {
    return fetch(api.url(endpointTemplate, params), {
      headers: { [HTTP_HEADER.ACCEPT]: HTTP_ACCEPT.JSON },
      ...init,
    });
  },
};
