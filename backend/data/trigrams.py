# ─────────────────────────────────────────────────────────────
# The eight trigrams (八卦), keyed by 先天八卦数 (1–8).
# `lines` are bottom → top; True = yang (solid line).
#
# Ported from src/data/trigrams.ts — keep in sync.
# ─────────────────────────────────────────────────────────────
from typing import List

class Trigram:
    def __init__(self, no: int, pinyin: str, name: str, nature: str, symbol: str, lines: List[bool]):
        self.no = no
        self.pinyin = pinyin
        self.name = name
        self.nature = nature
        self.symbol = symbol
        self.lines = lines  # bottom → top

    def __repr__(self) -> str:
        return f"Trigram({self.no}, {self.name})"


TRIGRAMS = {
    1: Trigram(1, "Qián",  "The Creative",    "Heaven",  "☰", [True,  True,  True]),
    2: Trigram(2, "Duì",   "The Joyous",      "Lake",    "☱", [True,  True,  False]),
    3: Trigram(3, "Lí",    "The Clinging",    "Fire",    "☲", [True,  False, True]),
    4: Trigram(4, "Zhèn",  "The Arousing",    "Thunder", "☳", [True,  False, False]),
    5: Trigram(5, "Xùn",   "The Gentle",      "Wind",    "☴", [False, True,  True]),
    6: Trigram(6, "Kǎn",   "The Abysmal",     "Water",   "☵", [False, True,  False]),
    7: Trigram(7, "Gèn",   "Keeping Still",   "Mountain","☶", [False, False, True]),
    8: Trigram(8, "Kūn",   "The Receptive",   "Earth",   "☷", [False, False, False]),
}


def trigram_no_from_lines(lines: List[bool]) -> int:
    """Recover the 先天数 from three lines (bottom → top)."""
    v = (1 if lines[0] else 0) + (2 if lines[1] else 0) + (4 if lines[2] else 0)
    return 8 - v
