// ─────────────────────────────────────────────────────────────
// "Answer Card" share poster — pure Canvas 2D rendering so the
// output is a downloadable PNG / shareable image. Contains the
// hexagram mark, the reading, a QR code back to the site, and
// the compliance disclaimer. Locked readings show only the
// "present" sentence with an unlock CTA (protects monetization).
// ─────────────────────────────────────────────────────────────

import QRCode from 'qrcode'
import { HEXAGRAMS } from '@/data/hexagrams'
import type { Question } from '@/types'

const W = 1080
const H = 1350
const BAMBOO = '#31523c'
const BAMBOO_SOFT = '#4A7C59'
const EMBER = '#c46a38'
const INK = '#2b2f2c'
const MUTED = 'rgba(43,47,44,0.55)'
const CREAM = '#F5E6CA'
const CARD = '#fdf9f0'

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawHexagram(ctx: CanvasRenderingContext2D, q: Question, cx: number, top: number) {
  const width = 132
  const barH = 11
  const gap = 21
  const height = barH * 6 + gap * 5
  const yinGap = 22
  q.hexagram.lines.forEach((yang, i) => {
    const y = top + height - barH - i * (barH + gap)
    const moving = i + 1 === q.hexagram.movingYao
    ctx.fillStyle = moving ? EMBER : BAMBOO
    if (moving) {
      ctx.shadowColor = 'rgba(196,106,56,0.45)'
      ctx.shadowBlur = 14
    }
    if (yang) {
      roundRect(ctx, cx - width / 2, y, width, barH, barH / 2)
      ctx.fill()
    } else {
      const piece = (width - yinGap) / 2
      roundRect(ctx, cx - width / 2, y, piece, barH, barH / 2)
      ctx.fill()
      roundRect(ctx, cx + yinGap / 2, y, piece, barH, barH / 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
  })
}

interface Section {
  label: string
  body?: string
  locked?: boolean
}

export async function generatePoster(question: Question): Promise<string> {
  await document.fonts.ready.catch(() => undefined)

  const reading = HEXAGRAMS[question.hexagram.primaryNo]
  const unlocked = question.isUnlocked
  const siteUrl = `${window.location.origin}/`

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#faf2e1')
  bg.addColorStop(1, CREAM)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Inner border
  ctx.strokeStyle = 'rgba(74,124,89,0.25)'
  ctx.lineWidth = 2
  roundRect(ctx, 36, 36, W - 72, H - 72, 28)
  ctx.stroke()

  // Brand
  ctx.textAlign = 'center'
  ctx.fillStyle = BAMBOO_SOFT
  ctx.font = '600 26px Inter, system-ui, sans-serif'
  ctx.fillText('A N S W E R   C A R D', W / 2, 104)

  // Hexagram
  drawHexagram(ctx, question, W / 2, 150)

  // Name + keyword
  ctx.fillStyle = BAMBOO
  ctx.font = '600 58px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(reading.name, W / 2, 388)
  ctx.fillStyle = EMBER
  ctx.font = 'italic 36px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(`“${reading.keyword}”`, W / 2, 440)

  // The call (verdict) — the shareable one-liner
  ctx.fillStyle = BAMBOO
  ctx.font = '600 27px Inter, system-ui, sans-serif'
  const vLines = wrapText(ctx, question.interpretation.verdict, 820).slice(0, 2)
  vLines.forEach((l, i) => ctx.fillText(l, W / 2, 482 + i * 34))

  // Reading sections (the question itself is quoted inside "present")
  const sections: Section[] = [
    { label: 'WHAT’S HAPPENING NOW', body: question.interpretation.present },
    {
      label: 'WHAT’S BLOCKING YOU',
      body: unlocked ? question.interpretation.block : undefined,
      locked: !unlocked,
    },
    {
      label: 'WHAT TO DO NEXT',
      body: unlocked ? question.interpretation.next : undefined,
      locked: !unlocked,
    },
    {
      label: 'WHEN IT MOVES',
      body: unlocked ? question.interpretation.timing : undefined,
      locked: !unlocked,
    },
  ]

  let y = 482 + vLines.length * 34 + 44
  ctx.textAlign = 'left'
  for (const section of sections) {
    ctx.fillStyle = BAMBOO_SOFT
    ctx.font = '600 21px Inter, system-ui, sans-serif'
    ctx.fillText(section.label, 130, y)

    ctx.fillStyle = INK
    ctx.font = '400 28px "Cormorant Garamond", Georgia, serif'
    if (section.body) {
      const lines = wrapText(ctx, section.body, 820).slice(0, 2)
      lines.forEach((l, i) => ctx.fillText(l, 130, y + 38 + i * 34))
      y += 38 + lines.length * 34 + 24
    } else if (section.locked) {
      ctx.fillStyle = MUTED
      ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif'
      ctx.fillText('— locked. Unlock your full answer —', 130, y + 42)
      y += 104
    }
  }

  // Action ribbon (unlocked only)
  if (unlocked) {
    roundRect(ctx, 110, y - 12, 860, 96, 18)
    ctx.fillStyle = 'rgba(224,133,79,0.16)'
    ctx.fill()
    ctx.fillStyle = EMBER
    ctx.font = '600 23px Inter, system-ui, sans-serif'
    ctx.fillText('YOUR NEXT MOVE', 140, y + 26)
    ctx.fillStyle = INK
    ctx.font = '400 27px "Cormorant Garamond", Georgia, serif'
    const actionLines = wrapText(ctx, question.interpretation.action, 780).slice(0, 2)
    actionLines.forEach((l, i) => ctx.fillText(l, 140, y + 60 + i * 30))
    y += 110
  }

  // QR (top-right corner, clear of the centered brand and hexagram)
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: 240,
    margin: 1,
    color: { dark: BAMBOO, light: CARD },
  })
  const qrImg = new Image()
  qrImg.src = qrDataUrl
  await new Promise((resolve) => {
    qrImg.onload = resolve
    qrImg.onerror = resolve
  })
  ctx.drawImage(qrImg, W - 140 - 120, 76, 120, 120)

  // Footer: single compact line + disclaimer
  ctx.textAlign = 'left'
  ctx.fillStyle = BAMBOO
  ctx.font = '600 30px "Cormorant Garamond", Georgia, serif'
  const ctaText = 'Read your own moment'
  ctx.fillText(ctaText, 130, H - 96)
  const hostX = 130 + ctx.measureText(ctaText).width + 24
  ctx.fillStyle = BAMBOO_SOFT
  ctx.font = '400 26px Inter, system-ui, sans-serif'
  ctx.fillText(window.location.host, hostX, H - 96)
  ctx.fillStyle = MUTED
  ctx.font = '400 19px Inter, system-ui, sans-serif'
  ctx.fillText('For reflection and entertainment only.', 130, H - 56)

  return canvas.toDataURL('image/png')
}
