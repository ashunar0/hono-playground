import { cn } from "@/lib/cn";
import { Link } from "@ts-76/inertia-hono-jsx";

type Props = {
  voteCount: number;
  voted: boolean;
  /** false (未ログイン) なら ▲ クリックでログインへ誘導。 */
  canVote: boolean;
  onVote: () => void;
};

export function VoteButton({ voteCount, voted, canVote, onVote }: Props) {
  const cls = cn(
    "inline-flex items-center gap-1 text-xs",
    voted ? "font-medium text-orange-600" : "text-gray-500 hover:text-orange-600",
  );
  const label = (
    <>
      <span aria-hidden="true">▲</span>
      <span>{voteCount} points</span>
    </>
  );

  if (!canVote) {
    return (
      <Link href="/login" class={cls} title="投票するにはログイン">
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onVote} aria-pressed={voted} class={cls}>
      {label}
    </button>
  );
}
