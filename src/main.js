import './style.css'

const body = document.body
body.classList.add('js')

const menuButton = document.querySelector('.menu-toggle')
const nav = document.querySelector('.site-nav')

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true'
  menuButton.setAttribute('aria-expanded', String(!isOpen))
  nav?.classList.toggle('is-open', !isOpen)
})

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear()
})

const loadEmbed = (button) => {
  const url = button.dataset.embed
  if (!url) return

  const frame = document.createElement('iframe')
  frame.src = url
  frame.title = button.dataset.title || 'Media player'
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  frame.allowFullscreen = true
  frame.referrerPolicy = 'strict-origin-when-cross-origin'

  const container = button.closest('.featured-image, .player-shell, .card-media')
  if (!container) return
  container.classList.add('is-playing')
  container.append(frame)
  button.remove()
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-embed]')
  if (button) loadEmbed(button)
})

const musicGrid = document.querySelector('[data-music-grid]')

const makeMusicCard = (item) => {
  const article = document.createElement('article')
  article.className = 'music-card'
  article.dataset.group = item.group
  article.dataset.search = [item.title, item.artist, item.type, ...(item.tags || [])].join(' ').toLowerCase()

  const media = document.createElement('div')
  media.className = 'card-media'
  if (item.image) {
    const image = document.createElement('img')
    image.src = item.image
    image.alt = ''
    image.loading = 'lazy'
    image.width = 1280
    image.height = 720
    media.append(image)
  } else {
    media.classList.add('card-media-placeholder')
    const mark = document.createElement('span')
    mark.textContent = '~'
    mark.setAttribute('aria-hidden', 'true')
    media.append(mark)
  }

  if (item.embed) {
    const play = document.createElement('button')
    play.className = 'small-play'
    play.type = 'button'
    play.dataset.embed = item.embed
    play.dataset.title = `${item.title} media player`
    play.setAttribute('aria-label', `Play ${item.title}`)
    play.innerHTML = '<span aria-hidden="true">▶</span>'
    media.append(play)
  }

  const content = document.createElement('div')
  content.className = 'card-content'
  content.innerHTML = `
    <div class="card-meta"><span>${item.year}</span><span>${item.type}</span></div>
    <h2>${item.title}</h2>
    <p class="card-artist">${item.artist}</p>
    <p>${item.note}</p>
  `

  const foot = document.createElement('div')
  foot.className = 'card-foot'
  const tags = document.createElement('div')
  tags.className = 'tag-list'
  ;(item.tags || []).forEach((tag) => {
    const span = document.createElement('span')
    span.textContent = tag
    tags.append(span)
  })
  foot.append(tags)

  if (item.link) {
    const link = document.createElement('a')
    link.href = item.link
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.innerHTML = 'Original host <span aria-hidden="true">↗</span>'
    foot.append(link)
  }

  content.append(foot)
  article.append(media, content)
  return article
}

if (musicGrid) {
  fetch('/content/music.json')
    .then((response) => {
      if (!response.ok) throw new Error('Catalogue unavailable')
      return response.json()
    })
    .then((items) => {
      const cards = items.map(makeMusicCard)
      musicGrid.replaceChildren(...cards)
      cards.forEach((card) => {
        if (observer) observer.observe(card)
        else card.classList.add('is-visible')
      })
      document.querySelector('[data-catalogue-status]')?.remove()
      document.querySelector('.catalogue-fallback')?.remove()

      const buttons = document.querySelectorAll('[data-filter]')
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const filter = button.dataset.filter
          buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)))
          musicGrid.querySelectorAll('.music-card').forEach((card) => {
            card.hidden = filter !== 'all' && card.dataset.group !== filter
          })
        })
      })
    })
    .catch(() => {
      const status = document.querySelector('[data-catalogue-status]')
      if (status) status.textContent = 'The full catalogue could not load. The essential links are listed below.'
    })
}

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })
  : null

document.querySelectorAll('.portal, .music-card, .story-chapter, .process-fragment').forEach((element) => {
  if (observer) observer.observe(element)
  else element.classList.add('is-visible')
})
