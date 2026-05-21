import type { accountsService } from "./service";

export type Account = Awaited<ReturnType<typeof accountsService.list>>[number];

export type AccountsPageProps = {
  accounts: Account[];
};
