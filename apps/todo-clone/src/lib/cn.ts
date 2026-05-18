export const cn = (...args: Array<string | false | null | undefined>) =>
  args.filter(Boolean).join(" ");
