export interface Paginated<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string|null;
}