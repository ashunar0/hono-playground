import { Layout } from "@/components/Layout";
import { FormatHelp } from "@/features/import/components/FormatHelp";
import { PreviewSection } from "@/features/import/components/PreviewSection";
import { UploadForm } from "@/features/import/components/UploadForm";
import type { ImportPreview } from "@/features/import/types";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  preview: ImportPreview | null;
  message: string | null;
};

export default function Import({ preview, message }: Props) {
  return (
    <Layout>
      <div class="mx-auto max-w-5xl p-8">
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-2xl font-bold">CSV 取り込み</h1>
          <Link href="/" class="text-sm text-blue-600 hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        {message && (
          <div class="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
            {message}
          </div>
        )}

        <FormatHelp />

        <UploadForm action="/import" label="プレビュー" reuploadHint={Boolean(preview)} />

        {preview && <PreviewSection preview={preview} />}
      </div>
    </Layout>
  );
}
