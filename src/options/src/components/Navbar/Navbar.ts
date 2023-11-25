import ForgeDOM from '../../../../common/ForgeDOM'
import template from './Narbar.html'
import './Navbar.css'

import NavItem from './NavItem'

class Navbar {
  private readonly navbar: HTMLDivElement
  private readonly menuItems = ['General', 'Advanced Options', 'FAQs & Support', 'About']

  public constructor () {
    this.navbar = ForgeDOM.importNode<HTMLDivElement>(template)
    const navbarList = this.navbar.querySelector('.navbar__list') as HTMLUListElement
    this.menuItems.forEach((item) => {
      navbarList.render(NavItem, { title: item })
    })
  }

  render (): HTMLDivElement {
    return this.navbar
  }
}

export default Navbar
