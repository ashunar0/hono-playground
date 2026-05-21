// 値に , " 改行 が含まれる場合は "..." で囲み、" は "" にエスケープ (RFC 4180)。
const escapeCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const toCsvRow = (cells: ReadonlyArray<string | number | null | undefined>): string =>
  cells.map(escapeCell).join(",");

// 行配列を CRLF 連結 + 末尾 CRLF + UTF-8 BOM 付き。Excel で文字化けしないために必須。
export const toCsv = (
  rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>,
): string => {
  const body = rows.map(toCsvRow).join("\r\n");
  return `﻿${body}\r\n`;
};
