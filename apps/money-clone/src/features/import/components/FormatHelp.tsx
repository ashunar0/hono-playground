export function FormatHelp() {
  return (
    <section class="mb-6 rounded border border-gray-200 bg-white p-4 text-sm text-gray-700">
      <h2 class="mb-2 font-semibold">フォーマット</h2>
      <p class="mb-2">UTF-8、ヘッダー必須。カラム順は以下:</p>
      <code class="block whitespace-pre-wrap rounded bg-gray-50 px-3 py-2 font-mono text-xs">
        日付,種別,金額,口座,カテゴリ,メモ{"\n"}
        2026-05-01,支出,980,現金,食費,コーヒー
      </code>
      <ul class="mt-3 list-disc pl-5 text-xs text-gray-600">
        <li>口座 / カテゴリは「事前に登録した名前」を使うのだ (未登録だと弾く)</li>
        <li>種別とカテゴリの収支区分 (kind) が一致してないと弾く</li>
        <li>1 件でも warning があると確定できない</li>
      </ul>
    </section>
  );
}
