import { HTTP_ACCEPT, HTTP_HEADER } from "../data/http";
import { EXTENSION_API_BASE_URL } from "../data/api.data";
import { NODE_ENV } from "../data/extension.data";
import { interpolateTemplate } from "./interpolate";

function resolveBaseUrl(): string {
  return process.env.NODE_ENV === NODE_ENV.DEVELOPMENT
    ? EXTENSION_API_BASE_URL.LOCAL
    : EXTENSION_API_BASE_URL.PRODUCTION;
}

export const api = {
  url(
    endpointTemplate: string,
    params: Record<string, string | number> = {},
  ): string {
    return interpolateTemplate(resolveBaseUrl(), { endpoint: endpointTemplate, ...params });
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
