# ─────────────────────────────────────────────────────────────
# 梅花易数 · 时间起卦 + 铜钱起卦 (Python port).
#
# Ported from src/lib/divination.ts — keep in sync.
#
#   上卦 = (年支 + 月 + 日) mod 8        (0 → 8)
#   下卦 = (年支 + 月 + 日 + 时辰) mod 8  (0 → 8)
#   动爻 = (年支 + 月 + 日 + 时辰) mod 6  (0 → 6)
#
# Trigrams use 先天八卦数 (Qian=1 ... Kun=8). The resulting two
# trigrams form the primary hexagram; flipping the moving line
# yields the changed hexagram. This is internal computation —
# none of the traditional vocabulary is ever shown to users.
# ─────────────────────────────────────────────────────────────
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from lunar_python import Solar

from data.trigrams import TRIGRAMS, trigram_no_from_lines
from data.hexagrams import hexagram_no


def _div_mod(n: int, m: int) -> int:
    """mod m where a remainder of 0 maps to m (the traditional rule)."""
    return ((n - 1) % m) + 1


# ── Lunar helpers (ported from src/lib/lunar.ts) ──────────────

def solar_to_lunar(date: datetime) -> Tuple[int, int, int, bool]:
    """Return (year, month, day, is_leap_month) for the given datetime."""
    # lunar-python works with naive local datetimes; if tz-aware, strip tz.
    naive = date.replace(tzinfo=None) if date.tzinfo else date
    lunar = Solar.fromDate(naive).getLunar()
    raw_month = lunar.getMonth()
    return lunar.getYear(), abs(raw_month), lunar.getDay(), raw_month < 0


def year_branch_number(lunar_year: int) -> int:
    """年支数: 子=1 丑=2 ... 亥=12."""
    return ((lunar_year - 4) % 12) + 1


def hour_branch_number(date: datetime) -> int:
    """时辰数: 子时(23:00–01:00)=1 ... 亥时=12."""
    return (((date.hour + 1) % 24) // 2) + 1


def shichen_index_for(date: datetime) -> int:
    """时辰 index 0–11 (子 = 0)."""
    return ((date.hour + 1) % 24) // 2


# ── Shared assembly ─────────────────────────────────────────

def _assemble_hexagram(
    lines: List[bool],
    moving_yao: int,
    cast_mode: str,
    date: datetime,
    coin_tosses: Optional[List[List[int]]] = None,
):
    """Build a HexagramResult dict (matches frontend shape)."""
    upper_trigram = trigram_no_from_lines(lines[3:6])
    lower_trigram = trigram_no_from_lines(lines[0:3])

    # Flip the moving line to get the changed hexagram.
    changed_lines = [not line if i == moving_yao - 1 else line for i, line in enumerate(lines)]
    changed_lower = trigram_no_from_lines(changed_lines[0:3])
    changed_upper = trigram_no_from_lines(changed_lines[3:6])

    lunar_year, lunar_month, lunar_day, _ = solar_to_lunar(date)

    return {
        "primaryNo": hexagram_no(upper_trigram, lower_trigram),
        "changedNo": hexagram_no(changed_upper, changed_lower),
        "movingYao": moving_yao,
        "lines": lines,
        "changedLines": changed_lines,
        "upperTrigram": upper_trigram,
        "lowerTrigram": lower_trigram,
        "castMode": cast_mode,
        "coinTosses": coin_tosses,
        "shichenIndex": shichen_index_for(date),
        "lunar": {
            "year": lunar_year,
            "month": lunar_month,
            "day": lunar_day,
            "hourBranch": hour_branch_number(date),
        },
    }


def cast_by_time(date: datetime) -> dict:
    """Time-based casting (梅花易数 · 时间起卦)."""
    lunar_year, lunar_month, lunar_day, _ = solar_to_lunar(date)
    year_num = year_branch_number(lunar_year)
    month_num = lunar_month
    day_num = lunar_day
    hour_num = hour_branch_number(date)

    base = year_num + month_num + day_num
    upper_trigram = _div_mod(base, 8)
    lower_trigram = _div_mod(base + hour_num, 8)
    moving_yao = _div_mod(base + hour_num, 6)

    # Primary hexagram lines, bottom → top: lower trigram then upper.
    lines = list(TRIGRAMS[lower_trigram].lines) + list(TRIGRAMS[upper_trigram].lines)

    return _assemble_hexagram(lines, moving_yao, "time", date)


# ── 铜钱起卦 (three-coin casting) ────────────────────────────
# Six throws of three coins, one line per throw, bottom → top.
# Heads = 3, tails = 2; the sum decides the line:
#   9 old yang (moves) · 7 young yang · 8 young yin · 6 old yin (moves)
# Mei Hua requires exactly one moving line, so:
#   · several old lines → the lowest one acts (the first stirring governs)
#   · a still hexagram  → the trigram numbers pick the line.

HEADS = 3
TAILS = 2


def _throw_sum(t: List[int]) -> int:
    return t[0] + t[1] + t[2]


def cast_by_coins(tosses: List[List[int]], date: datetime) -> dict:
    if len(tosses) != 6:
        raise ValueError("Coin casting needs exactly six throws")

    sums = [_throw_sum(t) for t in tosses]
    lines = [s == 7 or s == 9 for s in sums]

    # Moving-line candidates: every 6 or 9. The lowest one governs.
    moving_yao = 0
    for i, s in enumerate(sums):
        if s == 6 or s == 9:
            moving_yao = i + 1
            break

    if moving_yao == 0:
        # A still hexagram: pick the moving line from the trigram numbers.
        upper = trigram_no_from_lines(lines[3:6])
        lower = trigram_no_from_lines(lines[0:3])
        moving_yao = _div_mod(upper + lower, 6)

    return _assemble_hexagram(lines, moving_yao, "coin", date, tosses)


import random


def random_coin_tosses() -> List[List[int]]:
    """Six fresh throws of three coins (3 = heads, 2 = tails)."""
    return [[random.choice([HEADS, TAILS]) for _ in range(3)] for _ in range(6)]
