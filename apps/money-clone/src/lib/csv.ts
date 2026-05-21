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

// RFC 4180 簡易 parser。BOM 剥がし、quoted cell + "" エスケープ、CRLF/LF 両対応。
// 空行はスキップ、最終行末の改行は許容。
export const parseCsv = (text: string): string[][] => {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;
  const len = src.length;

  const endCell = () => {
    row.push(cell);
    cell = "";
  };
  const endRow = () => {
    endCell();
    // 完全な空行 ([""]) は無視。
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };

  while (i < len) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        // 連続する "" はエスケープされた "。
        if (i + 1 < len && src[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      endCell();
      i += 1;
      continue;
    }
    if (ch === "\r") {
      // CRLF をまとめて扱う。
      endRow();
      i += src[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    if (ch === "\n") {
      endRow();
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  // 末尾に EOL 無しで終わったケース。
  if (cell !== "" || row.length > 0) endRow();
  return rows;
};
