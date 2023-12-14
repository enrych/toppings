import ForgeDOM from '../../common/ForgeDOM'
import './App.css'

import Navbar from './components/Navbar/Navbar'

class App {
  private currentPage: string = 'general'
  private readonly App: HTMLElement

  constructor () {
    this.App = ForgeDOM.importNode(TEMPLATE)
  }

  render (): HTMLElement {
    switch (this.currentPage) {
      case 'general':
        this.App.attach(Navbar)
        return this.App
      default:
        return this.App
    }
  }

  public navigateToPage (page: string): void {
    this.currentPage = page
    this.render()
  }
}

const TEMPLATE = '<template><div class="App"></div></template>'

export default App
