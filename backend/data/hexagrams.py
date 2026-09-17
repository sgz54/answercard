# ─────────────────────────────────────────────────────────────
# The 64 hexagrams. `name` and `keyword` are shown to users;
# `virtue` is the "human way" of the hexagram in the spirit of
# Ni Haixia's Tian Ji lectures.
#
# Ported from src/data/hexagrams.ts — keep in sync.
# ─────────────────────────────────────────────────────────────
from typing import List


class HexagramReading:
    __slots__ = ("no", "name", "keyword", "virtue")

    def __init__(self, no: int, name: str, keyword: str, virtue: str):
        self.no = no
        self.name = name
        self.keyword = keyword
        self.virtue = virtue

    def __repr__(self) -> str:
        return f"Hexagram({self.no}, {self.name})"


HEXAGRAMS = {
    1:  HexagramReading(1,  "The Creative",            "Momentum is building",        "Lead it yourself; strength proves itself in motion, not in waiting."),
    2:  HexagramReading(2,  "The Receptive",          "Let it come to you",          "Carry the thing steadily and let results speak — no forcing, no bragging."),
    3:  HexagramReading(3,  "Difficulty at the Beginning", "The sprout pushes through stone", "Expect the first mile to be hard; ask for help early instead of struggling alone."),
    4:  HexagramReading(4,  "Youthful Folly",          "Gather information first",    "Stay teachable — ask the basic questions instead of pretending you know."),
    5:  HexagramReading(5,  "Waiting",                 "Timing is working for you",   "Hold your position and prepare in peace; the timing will come to you."),
    6:  HexagramReading(6,  "Conflict",                "Do not meet force head-on",   "Refuse the fight; you win by staying calm and out of the mud."),
    7:  HexagramReading(7,  "The Army",                "It needs a plan and a leader","Bring order first: define roles and rules before spending anyone\u2019s energy."),
    8:  HexagramReading(8,  "Holding Together",        "Closeness needs a container", "Build belonging with small kept promises, not grand words."),
    9:  HexagramReading(9,  "Small Taming",            "Small forces do the work",    "Small consistent pressure beats one big push — tend it daily."),
    10: HexagramReading(10, "Treading",                "Step carefully, keep walking","Walk carefully and keep your manners; your conduct is your protection."),
    11: HexagramReading(11, "Peace",                   "The flow is open now",        "Use the open window now and bank the gains — nothing stays still."),
    12: HexagramReading(12, "Standstill",              "Force closes it further",     "Stop pushing the closed door; withdraw with integrity and wait for the turn."),
    13: HexagramReading(13, "Fellowship",              "This works better together",  "Find the shared cause and say it out loud; openness gathers allies."),
    14: HexagramReading(14, "Great Possession",        "You already hold what matters","Own what you have responsibly; generosity now is what secures it."),
    15: HexagramReading(15, "Modesty",                 "Quiet competence opens it",   "Understate and overdeliver; quietness keeps the mountain standing."),
    16: HexagramReading(16, "Enthusiasm",             "Align before you accelerate", "Give people something to march behind — enthusiasm needs a direction."),
    17: HexagramReading(17, "Following",              "Follow what genuinely attracts you", "Choose what you serve carefully; following well is a strength, not a weakness."),
    18: HexagramReading(18, "Work on the Decayed",    "Old business needs cleaning", "Fix the rotten root, not the leaves; do the unpleasant repair now."),
    19: HexagramReading(19, "Approach",                "The tide is rising — wade in","Come forward while the tide is high; presence right now is everything."),
    20: HexagramReading(20, "Contemplation",          "Look before you lean in",     "Step back and watch the whole field; see before you act."),
    21: HexagramReading(21, "Biting Through",         "One knot must be cut",        "Bite through the obstruction in one firm decision; half-measures jam it further."),
    22: HexagramReading(22, "Grace",                  "Form matters, not foundations","Polish the form but feed the substance; beauty without weight collapses."),
    23: HexagramReading(23, "Splitting Apart",        "Let the old peel away",       "Let what is falling, fall; do not prop up the decaying."),
    24: HexagramReading(24, "Return",                  "The turn is happening",       "Trust the turn; small signs of coming back deserve a small real response."),
    25: HexagramReading(25, "Innocence",              "Drop the strategy",           "Act plainly, without hidden angles; sincerity is the whole strategy."),
    26: HexagramReading(26, "Great Taming",           "Gather before you release",   "Stock the reserves before the crossing; discipline now buys the big move later."),
    27: HexagramReading(27, "Nourishment",            "Watch what feeds you",        "Watch what you feed yourself — words, food, company; change the input, change the outcome."),
    28: HexagramReading(28, "Great Exceeding",         "The load needs sharing",      "The beam is bending; redistribute the load before it snaps."),
    29: HexagramReading(29, "The Abysmal",            "Flow through it",             "Cross the gorge one pool at a time; keep your heart steady in repeated water."),
    30: HexagramReading(30, "The Clinging",            "Attach to what is steady",    "Stay near what burns steady; clarity comes from the right fire, not the brightest."),
    31: HexagramReading(31, "Influence",              "Something is moving between you", "Let real feeling move you without forcing the outcome; openness attracts."),
    32: HexagramReading(32, "Duration",               "Consistency creates the luck","Make it boring and repeat it; endurance, not intensity, writes the future."),
    33: HexagramReading(33, "Retreat",                "Stepping back is progress",   "Withdraw in good order; retreating with grace keeps everything intact."),
    34: HexagramReading(34, "Great Power",            "Aim your strength carefully", "Do not use force just because you have it; restraint is what makes power great."),
    35: HexagramReading(35, "Progress",               "Rise steadily, keep bearings","Rise like the sunrise — steady, visible, warming others as you go."),
    36: HexagramReading(36, "Darkening of the Light", "Protect your light",          "Hide your light in hostile ground; survive first, shine later."),
    37: HexagramReading(37, "The Family",             "Order starts in the inner circle", "Put the inner circle in right order; everything outside follows it."),
    38: HexagramReading(38, "Opposition",             "The gap is smaller than it looks", "In difference, look for the small shared want; meet on the middle ground."),
    39: HexagramReading(39, "Obstruction",            "The direct route is closed",  "When the mountain blocks, turn; the wise path goes around, not through."),
    40: HexagramReading(40, "Deliverance",            "The tension is releasing",    "The thaw has come; loose the old grudge and move before it refreezes."),
    41: HexagramReading(41, "Decrease",               "Less is the doorway",         "Give something up on purpose; what you cut feeds what you keep."),
    42: HexagramReading(42, "Increase",               "Giving multiplies now",       "Give first; the season multiplies what is planted generously."),
    43: HexagramReading(43, "Breakthrough",           "One decision ends the standoff","Announce it plainly and act once, decisively; hesitation breeds the danger."),
    44: HexagramReading(44, "Coming to Meet",         "Inspect the tempting arrival","The charming arrival is a test; hold your line and watch before engaging."),
    45: HexagramReading(45, "Gathering Together",     "Things are converging",       "Gather people around a named purpose; presence plus vision holds them."),
    46: HexagramReading(46, "Pushing Upward",         "Rise one level at a time",    "Climb like a tree — step by step from the roots up; no skipping levels."),
    47: HexagramReading(47, "Oppression",            "Speak to the right listener", "Cornered, keep your words few and your spirit unbroken; speak to the one who hears."),
    48: HexagramReading(48, "The Well",               "The source is already there", "Keep the source clean and drawn daily; what nourishes never moves — maintain it."),
    49: HexagramReading(49, "Revolution",             "Change when the old is truly dead", "When the old form is truly dead, change in one clean stroke — no half revolutions."),
    50: HexagramReading(50, "The Cauldron",           "Combine and let it transform","Combine the ingredients and let them cook; new order needs patient heat."),
    51: HexagramReading(51, "The Arousing Thunder",   "A wake-up call, not a verdict","When thunder shakes, do not drop your cup; hold composure and act on facts."),
    52: HexagramReading(52, "Keeping Still",          "Stillness is the answer",     "Stop where you stand; stillness lets the right thought arrive."),
    53: HexagramReading(53, "Development",            "Gradual is the right speed",  "Marry the process: steady steps in the right order beat any shortcut."),
    54: HexagramReading(54, "The Marrying Maiden",   "Know your position first",    "Know your position and keep your standards; never enter what you must beg to stay in."),
    55: HexagramReading(55, "Abundance",              "Spend the peak well",         "At the peak, be generous and decisive; abundance kept out of fear curdles."),
    56: HexagramReading(56, "The Wanderer",           "Travel light here",          "In strange territory, travel light and mind your manners; nothing here is yours to grip."),
    57: HexagramReading(57, "The Gentle",             "Soft persistence penetrates", "Enter like wind — small, repeated, patient; softness penetrates what force cannot."),
    58: HexagramReading(58, "The Joyous",             "Openness carries it",        "Let genuine gladness show; shared joy is the lake that feeds two shores."),
    59: HexagramReading(59, "Dispersion",             "Melt the walls",             "Dissolve the walls with one real gesture; scattered hearts regather over warmth."),
    60: HexagramReading(60, "Limitation",            "The right limit frees you",  "Draw the boundary and keep it; the right limit is freedom, not a cage."),
    61: HexagramReading(61, "Inner Truth",            "Sincerity moves it",         "Let your inner truth carry it; sincerity reaches further than strategy."),
    62: HexagramReading(62, "Small Exceeding",       "Small things weigh most now", "In small matters, exceed slightly — extra care, extra respect; fly low, not high."),
    63: HexagramReading(63, "After Completion",       "Secure the finish",          "Order won is order to defend; mind the small leaks before they flood."),
    64: HexagramReading(64, "Before Completion",      "The last step is delicate",  "You are almost across; gather everything for the final careful steps."),
}

# King Wen lookup: rows = upper trigram 先天数 1–8, cols = lower 1–8.
HEXAGRAM_MATRIX: List[List[int]] = [
    [1, 10, 14, 25, 44, 6,  33, 12],
    [43, 58, 49, 17, 28, 47, 31, 45],
    [13, 38, 30, 21, 50, 64, 56, 35],
    [34, 54, 55, 51, 32, 40, 62, 16],
    [9,  61, 37, 42, 57, 59, 53, 20],
    [5,  60, 63, 3,  48, 29, 39, 8],
    [26, 41, 22, 27, 18, 4,  52, 23],
    [11, 19, 36, 24, 46, 7,  15, 2],
]


def hexagram_no(upper_trigram_no: int, lower_trigram_no: int) -> int:
    return HEXAGRAM_MATRIX[upper_trigram_no - 1][lower_trigram_no - 1]
