import { useEffect, useState } from 'react'
import { generatePoster } from '@/lib/poster'
import type { Question } from '@/types'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  question: Question
}

export default function ShareModal({ open, onClose, question }: ShareModalProps) {
  const [dataUrl, setDataUrl] = useState('')
  const [busy, setBusy] = useState(true)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (!open) return
    setBusy(true)
    setShared(false)
    let cancelled = false
    generatePoster(question)
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, question])

  if (!open) return null

  const download = () => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `answer-card-${question.id.slice(0, 8)}.png`
    a.click()
  }

  const nativeShare = async () => {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'answer-card.png', { type: 'image/png' })
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }
    if (navigator.share && nav.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Answer Card',
        text: 'Read this moment with Answer Card.',
      })
      setShared(true)
    } else {
      download()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bamboo-900/55 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="animate-fadeUp max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream-50 p-6 shadow-2xl soft-scroll sm:rounded-3xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-serif text-2xl text-bamboo-800">Your Answer Card</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/40 transition hover:bg-bamboo-50 hover:text-ink"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-cream-200">
          {busy ? (
            <div className="flex aspect-[4/5] items-center justify-center text-sm text-bamboo-700">
              Painting your card…
            </div>
          ) : (
            <img src={dataUrl} alt="Your answer card poster" className="block w-full" />
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => void nativeShare()}
            disabled={busy}
            className="flex-1 rounded-2xl bg-bamboo-500 py-3 text-sm font-medium text-cream-50 transition hover:bg-bamboo-600 disabled:opacity-50"
          >
            {shared ? 'Shared ✓' : 'Share My Answer'}
          </button>
          <button
            onClick={download}
            disabled={busy}
            className="rounded-2xl border border-bamboo-300 px-5 py-3 text-sm font-medium text-bamboo-700 transition hover:bg-bamboo-50 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
