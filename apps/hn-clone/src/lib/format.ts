// URL からドメイン部分だけ取り出す (例: https://example.com/a → example.com)。HN の (host) 表示用。
export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const UNITS: [limit: number, sec: number, label: string][] = [
  [60, 1, "秒"],
  [3600, 60, "分"],
  [86400, 3600, "時間"],
  [2592000, 86400, "日"],
  [31536000, 2592000, "ヶ月"],
  [Number.POSITIVE_INFINITY, 31536000, "年"],
];

// 投稿からの経過を「N分前」形式で返す。
export const timeAgo = (date: Date, now: Date = new Date()): string => {
  const diff = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (diff < 5) return "たった今";
  for (const [limit, sec, label] of UNITS) {
    if (diff < limit) return `${Math.floor(diff / sec)}${label}前`;
  }
  return "たった今";
};
