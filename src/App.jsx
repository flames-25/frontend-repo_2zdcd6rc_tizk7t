import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function Navbar({ onToggleTheme, theme }) {
  const links = [
    { href: '#products', label: 'Products' },
    { href: '#industries', label: 'Industries' },
    { href: '#blog', label: 'Blog/News' },
    { href: '#contact', label: 'Contact' },
  ]
  return (
    <div className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-zinc-900/70 border-b border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="font-semibold tracking-tight text-xl">Motodrives</a>
        <nav className="hidden md:flex gap-6 text-sm">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className="px-3 py-1.5 rounded-md border text-sm border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
            {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <a href="#contact" className="hidden md:inline-block px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-500">Enquire</a>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative h-[60vh] md:h-[70vh] w-full" aria-label="Hero">
      <div className="absolute inset-0 -z-10">
        <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-zinc-900 dark:via-zinc-900/60" />
      <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Industrial Drives, Motors, Pumps & Gear Boxes</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-2xl">Reliable motion and power solutions for every industry. Explore our product catalog and case studies.</p>
      </div>
    </section>
  )
}

function Counters() {
  const items = [
    { label: 'Projects', value: 1200 },
    { label: 'Clients', value: 450 },
    { label: 'Years', value: 20 },
    { label: 'SKUs', value: 340 },
  ]
  return (
    <section className="py-10 border-t border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold">{it.value.toLocaleString()}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 mt-1">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Products() {
  const [q, setQ] = useState('')
  const dq = useDebouncedValue(q, 300)
  const [category, setCategory] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (dq) params.set('q', dq)
        if (category) params.set('category', category)
        const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [dq, category])

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category_slug).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [items])

  return (
    <section id="products" className="py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-semibold">Featured Products</h2>
          <div className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950" />
            <select value={category} onChange={e => setCategory(e.target.value === 'all' ? '' : e.target.value)} className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950">
              {categories.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" />
          ))}
          {!loading && items.map(p => (
            <article key={p.id} className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-black/5 dark:bg-white/5" />
              )}
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500">{p.category_slug || 'uncategorized'}</div>
                <h3 className="font-semibold mt-1">{p.name}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1">{p.description || '—'}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Blogs() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetch(`${API_BASE}/api/blogs`).then(r => r.json()).then(d => setPosts(d.items || [])).catch(console.error)
  }, [])
  return (
    <section id="blog" className="py-14 border-t border-black/5 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Latest News</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map(p => (
            <article key={p.id} className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
              {p.image ? <img src={p.image} alt={p.title} loading="lazy" className="h-40 w-full object-cover" /> : <div className="h-40 w-full bg-black/5 dark:bg-white/5" />}
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-zinc-500">{new Date(p.created_at || Date.now()).toLocaleDateString()}</div>
                <h3 className="font-semibold mt-1">{p.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1">{p.content?.slice(0, 120) || '—'}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="py-14">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-semibold">Contact</h2>
        <p className="text-zinc-600 dark:text-zinc-300 mt-2">This preview collects no data. The final PHP build will include PHPMailer and persistence.</p>
        <form className="mt-6 grid grid-cols-1 gap-3">
          <input placeholder="Name" className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950" />
          <input placeholder="Email" className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950" />
          <input placeholder="Phone" className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950" />
          <textarea placeholder="Message" rows="5" className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950" />
          <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white w-fit">Send (Preview)</button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-10 border-t border-black/5 dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Motodrives</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Privacy</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Terms</a>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const [theme, setTheme] = useState(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
      <Navbar theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <Hero />
      <Counters />
      <Products />
      <Blogs />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
