
// Shows which words pushed the model towards Fake or Real,
// and highlights them inside the analyzed text.

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function HighlightedText({ text, fakeWords, realWords }) {
  const tone = new Map()
  fakeWords.forEach((w) => tone.set(normalize(w.word), 'fake'))
  realWords.forEach((w) => tone.set(normalize(w.word), 'real'))

  const terms = [...tone.keys()].sort((a, b) => b.length - a.length)
  if (!terms.length) return <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{text}</p>

  // "featured image" should also match "Featured  image" or "featured-image"
  const pattern = terms.map((t) => t.split(' ').map(escapeRegex).join('[^A-Za-z0-9]+')).join('|')
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')
  const parts = text.split(regex)

  return (
    <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
      {parts.map((part, i) => {
        const kind = i % 2 === 1 ? tone.get(normalize(part)) : null
        if (!kind) return <span key={i}>{part}</span>
        return (
          <mark
            key={i}
            className={`rounded px-0.5 ${kind === 'fake' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}
          >
            {part}
          </mark>
        )
      })}
    </p>
  )
}

function WordList({ title, words, color, empty }) {
  const max = Math.max(...words.map((w) => w.weight), 0.0001)
  return (
    <div className="rounded-xl border border-slate-900/8 p-4">
      <p className={`text-xs font-semibold uppercase tracking-wide ${color === 'danger' ? 'text-danger' : 'text-success'}`}>
        {title}
      </p>
      {words.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {words.map((w) => (
            <li key={w.word} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-ink">{w.word}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full ${color === 'danger' ? 'bg-danger' : 'bg-success'}`}
                  style={{ width: `${(w.weight / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ExplanationCard({ explanation, sourceText }) {
  if (!explanation) return null
  const fakeWords = explanation.fake_words || []
  const realWords = explanation.real_words || []

  return (
    <div>
      <h4 className="font-display font-bold text-base text-ink mb-1">Why this result?</h4>
      <p className="text-xs text-muted mb-4">
        Words the model found in your text and how strongly each pushed the result. Longer bar = stronger influence.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <WordList title="Pushed towards Fake" words={fakeWords} color="danger" empty="No strong fake-style words found." />
        <WordList title="Pushed towards Real" words={realWords} color="success" empty="No strong real-style words found." />
      </div>

      {sourceText && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-900/8 p-4 max-h-64 overflow-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Your text, highlighted</p>
          <HighlightedText text={sourceText} fakeWords={fakeWords} realWords={realWords} />
        </div>
      )}
    </div>
  )
}