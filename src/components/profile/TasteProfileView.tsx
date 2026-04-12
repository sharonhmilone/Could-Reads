import { useMemo } from 'react'
import type { TasteProfile } from '@/lib/types'
import { hashString, NEON_COLORS, NEON_DIMS, HL_CLASSES, pickBySeed, withAlpha } from '@/lib/utils'

interface TasteProfileViewProps {
  profile: TasteProfile
}

export function TasteProfileView({ profile }: TasteProfileViewProps) {
  const maxGenreCount = profile.topGenres[0]?.count ?? 1

  // Memoize all color lookups so hashString doesn't run on every render
  const genreColors  = useMemo(() => Object.fromEntries(
    profile.topGenres.map((g) => [g.genre, {
      neon: pickBySeed([...NEON_COLORS], g.genre),
      dim:  pickBySeed([...NEON_DIMS], g.genre),
    }])
  ), [profile.topGenres])

  const authorColors = useMemo(() => Object.fromEntries(
    profile.topAuthors.map((a) => [a.author, {
      hl:  pickBySeed([...HL_CLASSES], a.author),
      dim: pickBySeed([...NEON_DIMS], a.author),
      neon: pickBySeed([...NEON_COLORS], a.author),
    }])
  ), [profile.topAuthors])

  const seriesColors = useMemo(() => Object.fromEntries(
    profile.seriesRead.map((s) => [s.series, {
      hl:  pickBySeed([...HL_CLASSES], s.series),
      dim: pickBySeed([...NEON_DIMS], s.series),
      neon: pickBySeed([...NEON_COLORS], s.series),
    }])
  ), [profile.seriesRead])

  const sampleColors = useMemo(() => profile.sampleBooks.map((b) => ({
    neon: pickBySeed([...NEON_COLORS], b.title),
    hl:   b.genre ? pickBySeed([...HL_CLASSES], b.genre) : null,
    dim:  b.genre ? pickBySeed([...NEON_DIMS], b.genre) : null,
  })), [profile.sampleBooks])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-type text-3xl text-ink mb-1">
          My <span className="hl-yellow">reading taste</span>
        </h2>
        <p className="font-hand text-lg text-ink-faded">
          {profile.totalBooksRead} books from {profile.sourceName} —
          what you read <em>is</em> the signal
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {([
          { label: 'books read',       value: profile.totalBooksRead,             neon: '#ff3db4' },
          { label: 'top genre',        value: profile.topGenres[0]?.genre ?? '—', neon: '#0090aa' },
          { label: 'series committed', value: profile.seriesRead.length,          neon: '#2a8a10' },
        ] as const).map(({ label, value, neon }, i) => (
          <div key={label} className="paper-card p-4 text-center"
            style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
            <div className="font-type text-3xl leading-none mb-1"
              style={{ color: neon, textShadow: `0 0 10px ${withAlpha(neon, 0.55)}` }}>
              {value}
            </div>
            <div className="font-hand text-sm text-ink-faded uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Genre bar chart */}
      {profile.topGenres.length > 0 && (
        <div className="paper-card p-5 space-y-3">
          <h3 className="font-type text-xl text-ink mb-4"><span className="hl-orange">Genres I read</span></h3>
          {profile.topGenres.slice(0, 10).map((g) => {
            const c = genreColors[g.genre]?.neon ?? '#fff'
            return (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="font-hand text-base text-ink-brown w-36 shrink-0 truncate">{g.genre}</span>
                <div className="flex-1 h-5 bg-paper-dark rounded-sm overflow-hidden">
                  <div className="h-full rounded-sm transition-all duration-700"
                    style={{ width: `${(g.count / maxGenreCount) * 100}%`, background: c,
                      boxShadow: `0 0 6px ${withAlpha(c, 0.55)}`, opacity: 0.85 }} />
                </div>
                <span className="font-hand text-sm shrink-0" style={{ color: genreColors[g.genre]?.dim }}>
                  {g.count}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Series */}
      {profile.seriesRead.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-1"><span className="hl-cyan">Series I stuck with</span></h3>
          <p className="font-hand text-sm text-ink-faded mb-4">Series with 2+ books read.</p>
          <div className="flex flex-wrap gap-2">
            {profile.seriesRead.map((s) => {
              const c = seriesColors[s.series]
              return (
                <span key={s.series} className={`tag-chip font-hand text-base ${c?.hl}`}
                  style={{ color: c?.dim }} title={`${s.count} books`}>
                  {s.series}
                  <span className="ml-1 text-xs opacity-70" style={{ color: c?.neon }}>×{s.count}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Authors */}
      {profile.topAuthors.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-4"><span className="hl-purple">Authors I return to</span></h3>
          <div className="flex flex-wrap gap-2">
            {profile.topAuthors.slice(0, 12).map((a) => {
              const c = authorColors[a.author]
              return (
                <span key={a.author} className={`tag-chip font-hand text-base ${c?.hl}`}
                  style={{ color: c?.dim }} title={`${a.count} books`}>
                  {a.author}
                  {a.count > 1 && (
                    <span className="ml-1 text-xs opacity-70" style={{ color: c?.neon }}>×{a.count}</span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Sample books */}
      {profile.sampleBooks.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-2"><span className="hl-green">What the AI knows I've read</span></h3>
          <p className="font-hand text-sm text-ink-faded mb-3">
            These titles inform the match scoring for your recommendations.
          </p>
          <ul className="space-y-0.5">
            {profile.sampleBooks.slice(0, 12).map((b, i) => {
              const c = sampleColors[i]
              return (
                <li key={i} className="flex items-baseline gap-2 font-hand text-base text-ink-brown flex-wrap">
                  <span style={{ color: c?.neon, textShadow: `0 0 3px ${withAlpha(c?.neon ?? '#fff', 0.5)}` }}>·</span>
                  <span>{b.title}</span>
                  {b.author && <span className="text-ink-faded text-sm">— {b.author}</span>}
                  {b.genre && c?.hl && (
                    <span className={`tag-chip text-xs ${c.hl}`} style={{ color: c.dim ?? undefined }}>{b.genre}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
