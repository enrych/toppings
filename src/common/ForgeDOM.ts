// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class ForgeDOM {
  private static parser: DOMParser
  public static parserCount: number = 0

  private static getParser (): DOMParser {
    if (ForgeDOM.parser === undefined) {
      ForgeDOM.parser = new DOMParser()
      ForgeDOM.parserCount++
    }

    return ForgeDOM.parser
  }

  public static importNode<T extends HTMLElement> (htmlString: string): T {
    const parser = ForgeDOM.getParser()
    const template = parser.parseFromString(htmlString, 'text/html').querySelector('template')
    if (template !== null) {
      return document.importNode(template.content, true).firstElementChild as T
    } else {
      throw new Error('Template element not found in the provided HTML string')
    }
  }
}

HTMLElement.prototype.render = function <T extends HTMLElement>(Child: Component<T>, props?: Props): T {
  if (props !== undefined) {
    this.appendChild(new Child(props).render())
  } else {
    this.appendChild(new Child().render())
  }
  return this as T
}

export default ForgeDOM
