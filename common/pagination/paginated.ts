export interface Pagination<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string|null;
}