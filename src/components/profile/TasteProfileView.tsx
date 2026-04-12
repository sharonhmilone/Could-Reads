import type { TasteProfile } from '@/lib/types'
import { hashString } from '@/lib/utils'

const NEON_COLORS = ['#ffe500', '#ff3db4', '#00e5ff', '#39ff14', '#ff6d00', '#c400ff']
const NEON_DIMS   = ['#c4a800', '#cc0090', '#0090aa', '#2a8a10', '#c04000', '#8800bb']
const HL_CLASSES  = ['hl-yellow', 'hl-pink', 'hl-cyan', 'hl-green', 'hl-orange', 'hl-purple']

function neon(s: string)  { return NEON_COLORS[hashString(s) % NEON_COLORS.length] }
function dim(s: string)   { return NEON_DIMS[hashString(s) % NEON_DIMS.length] }
function hl(s: string)    { return HL_CLASSES[hashString(s) % HL_CLASSES.length] }

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
          {profile.totalBooksRead} books from {profile.sourceName} —
          what you read <em>is</em> the signal
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'books read',    value: profile.totalBooksRead,          neon: '#ff3db4' },
          { label: 'top genre',     value: profile.topGenres[0]?.genre ?? '—', neon: '#0090aa' },
          { label: 'series committed', value: profile.seriesRead.length,    neon: '#2a8a10' },
        ].map(({ label, value, neon: n }, i) => (
          <div
            key={label}
            className="paper-card p-4 text-center"
            style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
          >
            <div
              className="font-type text-3xl leading-none mb-1"
              style={{ color: n, textShadow: `0 0 10px ${n}88` }}
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
            <span className="hl-orange">Genres I read</span>
          </h3>
          {profile.topGenres.slice(0, 10).map((g) => {
            const c = neon(g.genre)
            return (
              <div key={g.genre} className="flex items-center gap-3">
                <span className="font-hand text-base text-ink-brown w-36 shrink-0 truncate">
                  {g.genre}
                </span>
                <div className="flex-1 h-5 bg-paper-dark rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-all duration-700"
                    style={{
                      width: `${(g.count / maxGenreCount) * 100}%`,
                      background: c,
                      boxShadow: `0 0 6px ${c}88`,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="font-hand text-sm shrink-0" style={{ color: dim(g.genre) }}>
                  {g.count}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Series committed to */}
      {profile.seriesRead.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-1">
            <span className="hl-cyan">Series I stuck with</span>
          </h3>
          <p className="font-hand text-sm text-ink-faded mb-4">
            Series with 2+ books read — shows what I actually commit to.
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.seriesRead.map((s) => (
              <span
                key={s.series}
                className={`tag-chip font-hand text-base ${hl(s.series)}`}
                style={{ color: dim(s.series) }}
                title={`${s.count} books`}
              >
                {s.series}
                <span className="ml-1 text-xs opacity-70" style={{ color: neon(s.series) }}>
                  ×{s.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top authors */}
      {profile.topAuthors.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-4">
            <span className="hl-purple">Authors I return to</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.topAuthors.slice(0, 12).map((a) => (
              <span
                key={a.author}
                className={`tag-chip font-hand text-base ${hl(a.author)}`}
                style={{ color: dim(a.author) }}
                title={`${a.count} books`}
              >
                {a.author}
                {a.count > 1 && (
                  <span className="ml-1 text-xs opacity-70" style={{ color: neon(a.author) }}>
                    ×{a.count}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sample books */}
      {profile.sampleBooks.length > 0 && (
        <div className="paper-card p-5">
          <h3 className="font-type text-xl text-ink mb-2">
            <span className="hl-green">What the AI knows I've read</span>
          </h3>
          <p className="font-hand text-sm text-ink-faded mb-3">
            These titles inform the match scoring for your recommendations.
          </p>
          <ul className="space-y-0.5">
            {profile.sampleBooks.slice(0, 12).map((b, i) => (
              <li key={i} className="flex items-baseline gap-2 font-hand text-base text-ink-brown">
                <span style={{ color: neon(b.title), textShadow: `0 0 3px ${neon(b.title)}88` }}>·</span>
                <span>{b.title}</span>
                {b.author && <span className="text-ink-faded text-sm">— {b.author}</span>}
                {b.genre && <span className={`tag-chip text-xs ${hl(b.genre)}`} style={{ color: dim(b.genre) }}>{b.genre}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
