// Content scripts build real DOM nodes with dom-chef, not React. Files opt in
// with `/** @jsxImportSource dom-chef-jsx */`, which routes their JSX here and
// types elements as HTMLElement with native event handlers, instead of
// React's ReactNode and SyntheticEvent that the options and popup pages use.
import { h, Fragment as DomFragment } from "dom-chef";

type Child = Node | string | number | boolean | null | undefined | Child[];

type Props = {
  [attribute: string]: unknown;
  children?: Child;
};

type Component = (props: Props) => HTMLElement | SVGElement | DocumentFragment;

function flatten(child: Child, into: Node[]): Node[] {
  if (Array.isArray(child)) {
    for (const c of child) flatten(c, into);
  } else if (child instanceof Node) {
    into.push(child);
  } else if (typeof child === "string" || typeof child === "number") {
    into.push(document.createTextNode(String(child)));
  }
  return into;
}

export function jsx(type: string | Component, props: Props): HTMLElement {
  const { children, ...attributes } = props;
  return h(type as string, attributes, ...flatten(children, [])) as HTMLElement;
}

export const jsxs = jsx;
export const Fragment = DomFragment;

export namespace JSX {
  export type Element = HTMLElement;
  export interface IntrinsicElements {
    [tag: string]: Props;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
