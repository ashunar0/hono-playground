// CSV 取り込み前の解釈結果 + warning。lineNo は CSV 上の 1-indexed (ヘッダー含む)。
export type PreviewRow = {
  lineNo: number;
  raw: string[];
  date?: string;
  type?: "expense" | "income";
  amount?: number;
  accountId?: string;
  accountName?: string;
  categoryId?: string;
  categoryName?: string;
  memo?: string;
  warnings: string[];
};

export type ImportPreview = {
  rows: PreviewRow[];
  okCount: number;
  warnCount: number;
  canImport: boolean;
};

export type ImportConfirmResult =
  | { ok: true; inserted: number }
  | { ok: false; preview: ImportPreview };
