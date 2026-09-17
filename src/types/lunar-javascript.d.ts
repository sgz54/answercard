// Minimal ambient types for the subset of lunar-javascript we use.
declare module 'lunar-javascript' {
  export class Lunar {
    getYear(): number
    /** 1–12; negative for a leap month (e.g. -6 = leap sixth month) */
    getMonth(): number
    getDay(): number
  }

  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar
    static fromDate(date: Date): Solar
    getLunar(): Lunar
  }
}
