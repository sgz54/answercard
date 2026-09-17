// ─────────────────────────────────────────────────────────────
// The 64 hexagrams. `name` and `keyword` are shown to users;
// `virtue` is the "human way" of the hexagram in the spirit of
// Ni Haixia's Tian Ji lectures — the behavioral rule the image
// implies — appended to the concrete action. The three-sentence
// reading itself is generated from body/use dynamics in
// services/interpret.ts, so answers bind to the actual question.
// ─────────────────────────────────────────────────────────────

export interface HexagramReading {
  no: number
  name: string
  keyword: string
  virtue: string
}

export const HEXAGRAMS: Record<number, HexagramReading> = {
  1: { no: 1, name: 'The Creative', keyword: 'Momentum is building', virtue: 'Lead it yourself; strength proves itself in motion, not in waiting.' },
  2: { no: 2, name: 'The Receptive', keyword: 'Let it come to you', virtue: 'Carry the thing steadily and let results speak — no forcing, no bragging.' },
  3: { no: 3, name: 'Difficulty at the Beginning', keyword: 'The sprout pushes through stone', virtue: 'Expect the first mile to be hard; ask for help early instead of struggling alone.' },
  4: { no: 4, name: 'Youthful Folly', keyword: 'Gather information first', virtue: 'Stay teachable — ask the basic questions instead of pretending you know.' },
  5: { no: 5, name: 'Waiting', keyword: 'Timing is working for you', virtue: 'Hold your position and prepare in peace; the timing will come to you.' },
  6: { no: 6, name: 'Conflict', keyword: 'Do not meet force head-on', virtue: 'Refuse the fight; you win by staying calm and out of the mud.' },
  7: { no: 7, name: 'The Army', keyword: 'It needs a plan and a leader', virtue: 'Bring order first: define roles and rules before spending anyone\u2019s energy.' },
  8: { no: 8, name: 'Holding Together', keyword: 'Closeness needs a container', virtue: 'Build belonging with small kept promises, not grand words.' },
  9: { no: 9, name: 'Small Taming', keyword: 'Small forces do the work', virtue: 'Small consistent pressure beats one big push — tend it daily.' },
  10: { no: 10, name: 'Treading', keyword: 'Step carefully, keep walking', virtue: 'Walk carefully and keep your manners; your conduct is your protection.' },
  11: { no: 11, name: 'Peace', keyword: 'The flow is open now', virtue: 'Use the open window now and bank the gains — nothing stays still.' },
  12: { no: 12, name: 'Standstill', keyword: 'Force closes it further', virtue: 'Stop pushing the closed door; withdraw with integrity and wait for the turn.' },
  13: { no: 13, name: 'Fellowship', keyword: 'This works better together', virtue: 'Find the shared cause and say it out loud; openness gathers allies.' },
  14: { no: 14, name: 'Great Possession', keyword: 'You already hold what matters', virtue: 'Own what you have responsibly; generosity now is what secures it.' },
  15: { no: 15, name: 'Modesty', keyword: 'Quiet competence opens it', virtue: 'Understate and overdeliver; quietness keeps the mountain standing.' },
  16: { no: 16, name: 'Enthusiasm', keyword: 'Align before you accelerate', virtue: 'Give people something to march behind — enthusiasm needs a direction.' },
  17: { no: 17, name: 'Following', keyword: 'Follow what genuinely attracts you', virtue: 'Choose what you serve carefully; following well is a strength, not a weakness.' },
  18: { no: 18, name: 'Work on the Decayed', keyword: 'Old business needs cleaning', virtue: 'Fix the rotten root, not the leaves; do the unpleasant repair now.' },
  19: { no: 19, name: 'Approach', keyword: 'The tide is rising — wade in', virtue: 'Come forward while the tide is high; presence right now is everything.' },
  20: { no: 20, name: 'Contemplation', keyword: 'Look before you lean in', virtue: 'Step back and watch the whole field; see before you act.' },
  21: { no: 21, name: 'Biting Through', keyword: 'One knot must be cut', virtue: 'Bite through the obstruction in one firm decision; half-measures jam it further.' },
  22: { no: 22, name: 'Grace', keyword: 'Form matters, not foundations', virtue: 'Polish the form but feed the substance; beauty without weight collapses.' },
  23: { no: 23, name: 'Splitting Apart', keyword: 'Let the old peel away', virtue: 'Let what is falling, fall; do not prop up the decaying.' },
  24: { no: 24, name: 'Return', keyword: 'The turn is happening', virtue: 'Trust the turn; small signs of coming back deserve a small real response.' },
  25: { no: 25, name: 'Innocence', keyword: 'Drop the strategy', virtue: 'Act plainly, without hidden angles; sincerity is the whole strategy.' },
  26: { no: 26, name: 'Great Taming', keyword: 'Gather before you release', virtue: 'Stock the reserves before the crossing; discipline now buys the big move later.' },
  27: { no: 27, name: 'Nourishment', keyword: 'Watch what feeds you', virtue: 'Watch what you feed yourself — words, food, company; change the input, change the outcome.' },
  28: { no: 28, name: 'Great Exceeding', keyword: 'The load needs sharing', virtue: 'The beam is bending; redistribute the load before it snaps.' },
  29: { no: 29, name: 'The Abysmal', keyword: 'Flow through it', virtue: 'Cross the gorge one pool at a time; keep your heart steady in repeated water.' },
  30: { no: 30, name: 'The Clinging', keyword: 'Attach to what is steady', virtue: 'Stay near what burns steady; clarity comes from the right fire, not the brightest.' },
  31: { no: 31, name: 'Influence', keyword: 'Something is moving between you', virtue: 'Let real feeling move you without forcing the outcome; openness attracts.' },
  32: { no: 32, name: 'Duration', keyword: 'Consistency creates the luck', virtue: 'Make it boring and repeat it; endurance, not intensity, writes the future.' },
  33: { no: 33, name: 'Retreat', keyword: 'Stepping back is progress', virtue: 'Withdraw in good order; retreating with grace keeps everything intact.' },
  34: { no: 34, name: 'Great Power', keyword: 'Aim your strength carefully', virtue: 'Do not use force just because you have it; restraint is what makes power great.' },
  35: { no: 35, name: 'Progress', keyword: 'Rise steadily, keep bearings', virtue: 'Rise like the sunrise — steady, visible, warming others as you go.' },
  36: { no: 36, name: 'Darkening of the Light', keyword: 'Protect your light', virtue: 'Hide your light in hostile ground; survive first, shine later.' },
  37: { no: 37, name: 'The Family', keyword: 'Order starts in the inner circle', virtue: 'Put the inner circle in right order; everything outside follows it.' },
  38: { no: 38, name: 'Opposition', keyword: 'The gap is smaller than it looks', virtue: 'In difference, look for the small shared want; meet on the middle ground.' },
  39: { no: 39, name: 'Obstruction', keyword: 'The direct route is closed', virtue: 'When the mountain blocks, turn; the wise path goes around, not through.' },
  40: { no: 40, name: 'Deliverance', keyword: 'The tension is releasing', virtue: 'The thaw has come; loose the old grudge and move before it refreezes.' },
  41: { no: 41, name: 'Decrease', keyword: 'Less is the doorway', virtue: 'Give something up on purpose; what you cut feeds what you keep.' },
  42: { no: 42, name: 'Increase', keyword: 'Giving multiplies now', virtue: 'Give first; the season multiplies what is planted generously.' },
  43: { no: 43, name: 'Breakthrough', keyword: 'One decision ends the standoff', virtue: 'Announce it plainly and act once, decisively; hesitation breeds the danger.' },
  44: { no: 44, name: 'Coming to Meet', keyword: 'Inspect the tempting arrival', virtue: 'The charming arrival is a test; hold your line and watch before engaging.' },
  45: { no: 45, name: 'Gathering Together', keyword: 'Things are converging', virtue: 'Gather people around a named purpose; presence plus vision holds them.' },
  46: { no: 46, name: 'Pushing Upward', keyword: 'Rise one level at a time', virtue: 'Climb like a tree — step by step from the roots up; no skipping levels.' },
  47: { no: 47, name: 'Oppression', keyword: 'Speak to the right listener', virtue: 'Cornered, keep your words few and your spirit unbroken; speak to the one who hears.' },
  48: { no: 48, name: 'The Well', keyword: 'The source is already there', virtue: 'Keep the source clean and drawn daily; what nourishes never moves — maintain it.' },
  49: { no: 49, name: 'Revolution', keyword: 'Change when the old is truly dead', virtue: 'When the old form is truly dead, change in one clean stroke — no half revolutions.' },
  50: { no: 50, name: 'The Cauldron', keyword: 'Combine and let it transform', virtue: 'Combine the ingredients and let them cook; new order needs patient heat.' },
  51: { no: 51, name: 'The Arousing Thunder', keyword: 'A wake-up call, not a verdict', virtue: 'When thunder shakes, do not drop your cup; hold composure and act on facts.' },
  52: { no: 52, name: 'Keeping Still', keyword: 'Stillness is the answer', virtue: 'Stop where you stand; stillness lets the right thought arrive.' },
  53: { no: 53, name: 'Development', keyword: 'Gradual is the right speed', virtue: 'Marry the process: steady steps in the right order beat any shortcut.' },
  54: { no: 54, name: 'The Marrying Maiden', keyword: 'Know your position first', virtue: 'Know your position and keep your standards; never enter what you must beg to stay in.' },
  55: { no: 55, name: 'Abundance', keyword: 'Spend the peak well', virtue: 'At the peak, be generous and decisive; abundance kept out of fear curdles.' },
  56: { no: 56, name: 'The Wanderer', keyword: 'Travel light here', virtue: 'In strange territory, travel light and mind your manners; nothing here is yours to grip.' },
  57: { no: 57, name: 'The Gentle', keyword: 'Soft persistence penetrates', virtue: 'Enter like wind — small, repeated, patient; softness penetrates what force cannot.' },
  58: { no: 58, name: 'The Joyous', keyword: 'Openness carries it', virtue: 'Let genuine gladness show; shared joy is the lake that feeds two shores.' },
  59: { no: 59, name: 'Dispersion', keyword: 'Melt the walls', virtue: 'Dissolve the walls with one real gesture; scattered hearts regather over warmth.' },
  60: { no: 60, name: 'Limitation', keyword: 'The right limit frees you', virtue: 'Draw the boundary and keep it; the right limit is freedom, not a cage.' },
  61: { no: 61, name: 'Inner Truth', keyword: 'Sincerity moves it', virtue: 'Let your inner truth carry it; sincerity reaches further than strategy.' },
  62: { no: 62, name: 'Small Exceeding', keyword: 'Small things weigh most now', virtue: 'In small matters, exceed slightly — extra care, extra respect; fly low, not high.' },
  63: { no: 63, name: 'After Completion', keyword: 'Secure the finish', virtue: 'Order won is order to defend; mind the small leaks before they flood.' },
  64: { no: 64, name: 'Before Completion', keyword: 'The last step is delicate', virtue: 'You are almost across; gather everything for the final careful steps.' },
}

// ── King Wen lookup ───────────────────────────────────────────
// Rows = upper trigram, columns = lower trigram, both ordered by
// 先天数: 1 Qian, 2 Dui, 3 Li, 4 Zhen, 5 Xun, 6 Kan, 7 Gen, 8 Kun.
export const HEXAGRAM_MATRIX: number[][] = [
  [1, 10, 14, 25, 44, 6, 33, 12],
  [43, 58, 49, 17, 28, 47, 31, 45],
  [13, 38, 30, 21, 50, 64, 56, 35],
  [34, 54, 55, 51, 32, 40, 62, 16],
  [9, 61, 37, 42, 57, 59, 53, 20],
  [5, 60, 63, 3, 48, 29, 39, 8],
  [26, 41, 22, 27, 18, 4, 52, 23],
  [11, 19, 36, 24, 46, 7, 15, 2],
]

export function hexagramNo(upperTrigramNo: number, lowerTrigramNo: number): number {
  return HEXAGRAM_MATRIX[upperTrigramNo - 1][lowerTrigramNo - 1]
}
