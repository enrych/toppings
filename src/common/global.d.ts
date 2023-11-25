declare global {
  type Props = Record<string, unknown> | null
  interface HTMLElement extends ExtendedHTMLElement {}
  type Component<T extends HTMLElement> = new (props?: Props) => {
    render: () => T
  }
}

interface ExtendedHTMLElement<T extends HTMLElement = HTMLElement> {
  render: (child: Component<T>, props?: Props) => T
}

export {}
