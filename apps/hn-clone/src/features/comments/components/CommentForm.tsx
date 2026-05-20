import { inputClass } from "@/lib/inputClass";
import { Form } from "@ts-76/inertia-hono-jsx";

type Props = {
  storyId: number;
  /** 指定があれば返信 (親コメント id を hidden で送る)。未指定はトップレベル。 */
  parentId?: number;
  placeholder?: string;
};

export function CommentForm({ storyId, parentId, placeholder }: Props) {
  return (
    <Form action={`/stories/${storyId}/comments`} method="post" resetOnSuccess>
      {({ errors, processing }) => (
        <div class="flex flex-col gap-1">
          {parentId != null && <input type="hidden" name="parentId" value={parentId} />}
          <textarea
            name="text"
            rows={3}
            placeholder={placeholder}
            aria-invalid={errors.text ? "true" : undefined}
            class={inputClass(!!errors.text, "w-full text-sm")}
          />
          {errors.text && <p class="text-sm text-red-500">{errors.text}</p>}
          <button
            type="submit"
            disabled={processing}
            class="self-start rounded bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            送信
          </button>
        </div>
      )}
    </Form>
  );
}
