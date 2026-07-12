import { useEffect } from 'react'

const BASE_TITLE = 'APIMalaysia.my — API Directory for Southeast Asia'
const BASE_DESC = 'Discover, explore, and test 1,400+ APIs from across Southeast Asia. Curated directory of government open data and commercial APIs.'

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"][data-dynamic]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    el.setAttribute('data-dynamic', '')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOG(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"][data-dynamic]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    el.setAttribute('data-dynamic', '')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE
    const desc = description || BASE_DESC
    setMeta('description', desc)
    setOG('og:title', document.title)
    setOG('og:description', desc)
    setOG('twitter:title', document.title)
    setOG('twitter:description', desc)
  }, [title, description])
}
