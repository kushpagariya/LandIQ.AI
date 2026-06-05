import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const scrollToHashTarget = () => {
  const hash = window.location.hash
  if (!hash) {
    return
  }

  const targetId = decodeURIComponent(hash.slice(1))
  const target = document.getElementById(targetId)
  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

window.addEventListener('hashchange', scrollToHashTarget)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

requestAnimationFrame(() => {
  scrollToHashTarget()
})
