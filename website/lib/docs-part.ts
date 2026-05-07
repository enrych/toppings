import { URLS } from "@toppings/constants";
import type { ROUTE } from "@/lib/site.data";

export type DocsLinkTarget = keyof typeof URLS;
export type DocsRouteTarget = keyof typeof ROUTE;

export type DocsPart =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "em"; value: string }
  | { kind: "link"; target: DocsLinkTarget; label: string }
  | { kind: "route"; target: DocsRouteTarget; label: string }
  | { kind: "anchor"; id: string; label: string };
