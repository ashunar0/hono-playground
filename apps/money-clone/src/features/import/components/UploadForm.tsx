type Props = {
  action: string;
  label: string;
  // preview 表示後はファイル再選択が必要 (Inertia でファイルを保持しないため) なので案内文を出す。
  reuploadHint?: boolean;
};

export function UploadForm({ action, label, reuploadHint }: Props) {
  return (
    <form
      method="post"
      action={action}
      encType="multipart/form-data"
      class="mb-6 rounded border border-gray-200 bg-white p-4"
    >
      <label class="flex flex-col gap-2 text-sm">
        <span class="font-medium">CSV ファイル</span>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          class="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-emerald-700"
        />
      </label>
      <div class="mt-3 flex items-center gap-3">
        <button
          type="submit"
          class="rounded bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
        >
          {label}
        </button>
        {reuploadHint && (
          <span class="text-xs text-gray-500">
            ※ Inertia 経由でファイルを保持しないため、確定時は同じファイルをもう一度選んでね
          </span>
        )}
      </div>
    </form>
  );
}
