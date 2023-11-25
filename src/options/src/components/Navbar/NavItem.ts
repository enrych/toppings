import template from './NavItem.html'
import './NavItem.css'
import ForgeDOM from '../../../../common/ForgeDOM'

class NavItem {
  private readonly navItem: HTMLLIElement

  public constructor (private readonly props: { title: string }) {
    this.navItem = ForgeDOM.importNode<HTMLLIElement>(template)
    const itemContent = this.navItem.querySelector('.navbar__item-content') as HTMLSpanElement
    itemContent.textContent = this.props.title
  }

  render (): HTMLLIElement {
    return this.navItem
  }
}

export default NavItem
