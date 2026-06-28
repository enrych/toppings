import { HTTP_ACCEPT, HTTP_HEADER } from "../../data/http";
import { NODE_ENV } from "../../data/extension";
import { interpolateTemplate } from "../../utils/interpolate";

function resolveBaseUrl(): string {
  return process.env.NODE_ENV === NODE_ENV.DEVELOPMENT
    ? "http://127.0.0.1:8787/api{{endpoint}}"
    : "https://toppings.enry.ch/api{{endpoint}}";
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
