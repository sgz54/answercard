import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          to="/"
          className="font-serif text-2xl tracking-wide text-cream-50 drop-shadow-sm"
        >
          Answer Card
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {[
            { to: '/history', label: 'History' },
            { to: '/profile', label: 'Profile' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-cream-50/90 text-bamboo-800'
                    : 'text-cream-50/85 hover:bg-white/10 hover:text-cream-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-16 sm:px-8">{children}</main>
    </div>
  )
}
