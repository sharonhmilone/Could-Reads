import type { TasteProfile } from '@/lib/types'
import { hashString } from '@/lib/utils'

const HIGHLIGHTER_COLORS = ['hl-yellow', 'hl-pink', 'hl-cyan', 'hl-green', 'hl-orange', 'hl-purple']
const NEON_COLORS = ['#ffe500', '#ff3db4', '#00e5ff', '#39ff14', '#ff6d00', '#c400ff']
const NEON_DIMS  = ['#c4a800', '#cc0090', '#0090aa', '#2a8a10', '#c04000', '#8800bb']

function hlColor(s: string) {
  return HIGHLIGHTER_COLORS[hashString(s) % HIGHLIGHTER_COLORS.length]
}
function neonColor(s: string) {
  return NEON_COLORS[hashString(s) % NEON_COLORS.length]
}
function neonDim(s: string) {
  return NEON_DIMS[hashString(s) % NEON_DIMS.length]
}

interface TasteProfileViewProps {
  profile: TasteProfile
}

export function TasteProfileView({ profile }: TasteProfileViewProps) {
  const maxGenreCount = profile.topGenres[0]?.count ?? 1

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-type text-3xl text-ink mb-1">
          My <span className="hl-yellow">reading taste</span>
        </h2>
        <p className="font-hand text-lg text-ink-faded">
          Built from {profile.totalBooksImported} books in {profile.sourceName}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'books read',  value: profile.totalBooksRead, hl: 'hl-pink', neon: '#ff3db4' },
          { label: 'avg rating',  value: profile.averageRating > 0 ? `${profile.averageRating}★` : '—', hl: 'hl-yellow', neon: '#c4a800' },
          { label: 'top genre',   value: profile.topGenres[0]?.genre ?? '—', hl: 'hl-cyan', neon: '#0090aa' },
          { label: 'top author',  value: profile.topAuthors[0]?.author ?? '—', hl: 'hl-green', neon: '#2a8a10' },
        ].map(({ label, value, hl: hlClass, neon }, idx) => (
          <div
            key={label}
            className="paper-card p-4 text-center"
            style={{ transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)` }}
          >
            <div
              className={`font-type text-3xl leading-none mb-1 ${hlClass}`}
              style={{ color: neon, textShadow: `0 0 10px ${neon}88` }}
            >
              {value}
            </div>
            <div className="font-hand text-sm text-ink-faded uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Genre bar chart */}
      {profile.topGenres.length > 0 && (
        <div className="paper-card p-5 space-y-3">
          <h3 className="font-type text-xl text-ink mb-4">
            <span className="hl-orange">Genres</span>
          </h3>
          {profile.topGenres.slice(0, 10).map((g) => {
            const color = neonColor(g.genre)
            const dim = neonDim(g.genre)
            return (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="font-hand text-base text-ink-brown w-28 shrink-0 capitalize truncate">
                  {g.genre}
                </span>
                <div className="flex-1 h-5 bg-paper-dark rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-700"
                    style={{
                      width: `${(g.count / maxGenreCount) * 100}%`,
                      background: color,
                      boxShadow: `0 0 6px ${color}88`,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="font-hand text-sm shrink-0" style={{ color: dim }}>
                  {g.count}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Top authors */}
      {profile.topAuthors.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-4">
            <span className="hl-purple">Authors I've read most</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.topAuthors.slice(0, 12).map((a) => {
              const color = neonColor(a.author)
              const hl = hlColor(a.author)
              return (
                <span
                  key={a.author}
                  className={`tag-chip font-hand text-base ${hl}`}
                  style={{ color: neonDim(a.author) }}
                  title={`${a.count} books · avg ${a.avgRating}★`}
                >
                  {a.author}
                  <span
                    className="ml-1 text-xs opacity-70"
                    style={{ color }}
                  >
                    ×{a.count}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Rating distribution */}
      {Object.values(profile.ratingDistribution).some((v) => v > 0) && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-4">
            <span className="hl-green">How I rate</span>
          </h3>
          <div className="flex items-end gap-3 h-24">
            {Object.entries(profile.ratingDistribution)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([stars, count]) => {
                const maxCount = Math.max(...Object.values(profile.ratingDistribution))
                const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0
                const color = neonColor(stars)
                return (
                  <div key={stars} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                      <div
                        className="w-full rounded-sm transition-all duration-700"
                        style={{
                          height: `${heightPct}%`,
                          background: color,
                          boxShadow: `0 0 6px ${color}88`,
                          opacity: 0.8,
                          minHeight: count > 0 ? 4 : 0,
                        }}
                      />
                    </div>
                    <span className="font-hand text-sm text-ink-faded">{'★'.repeat(Number(stars))}</span>
                    <span className="font-hand text-xs text-ink-faded/60">{count}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Highly rated samples */}
      {profile.highlyRatedBooks.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-4">
            <span className="hl-yellow">Books I loved (4–5★)</span>
          </h3>
          <p className="font-hand text-sm text-ink-faded mb-3">
            These inform the AI's personal pitches for your recommendations.
          </p>
          <ul className="space-y-1">
            {profile.highlyRatedBooks.slice(0, 10).map((b, i) => (
              <li key={i} className="flex items-baseline gap-2 font-hand text-base text-ink-brown">
                <span style={{ color: neonColor(b.title), textShadow: `0 0 4px ${neonColor(b.title)}88` }}>
                  {'★'.repeat(b.rating ?? 0)}
                </span>
                <span>{b.title}</span>
                {b.author && <span className="text-ink-faded text-sm">— {b.author}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
