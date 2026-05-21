import type { categoriesService } from "./service";

export type Category = Awaited<ReturnType<typeof categoriesService.list>>[number];

export type CategoriesPageProps = {
  categories: Category[];
};
