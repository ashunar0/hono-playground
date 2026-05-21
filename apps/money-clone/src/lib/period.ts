// 'YYYY-MM' 形式の文字列を扱う薄いヘルパー。Date オブジェクトを介さず
// 文字列で計算するので timezone 罠を踏まない。

const PERIOD_RE = /^(\d{4})-(\d{2})$/;

export const isValidPeriod = (s: string): boolean => PERIOD_RE.test(s);

export const currentPeriod = (now: Date = new Date()): string => {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// period を delta ヶ月ずらす。負数で過去方向。
export const shiftPeriod = (period: string, delta: number): string => {
  const match = PERIOD_RE.exec(period);
  if (!match) throw new Error(`invalid period: ${period}`);
  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12
  // 1-based の月を 0-based に直して計算 → 戻す。
  const total = year * 12 + (month - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
};

export const formatPeriod = (period: string): string => {
  const match = PERIOD_RE.exec(period);
  if (!match) return period;
  return `${match[1]} 年 ${Number(match[2])} 月`;
};
