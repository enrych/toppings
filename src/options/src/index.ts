import ForgeDOM from '../../common/ForgeDOM'
import App from './App'

import './index.css'

const root = document.getElementById('root') as HTMLDivElement

root.attach(App)
console.log(ForgeDOM.parserCount)
