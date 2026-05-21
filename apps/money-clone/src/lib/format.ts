// 円表記の整形。amount は integer で持っているので toLocaleString に渡すだけで OK。
export const formatYen = (n: number): string => `¥${n.toLocaleString("ja-JP")}`;

// 符号付き表記。差引や月次収支のような「+/-」が意味を持つ場面で使う。
export const signedYen = (n: number): string =>
  `${n >= 0 ? "+" : "-"}${formatYen(Math.abs(n))}`;
