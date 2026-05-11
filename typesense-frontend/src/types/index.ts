// src/types/index.ts

export interface Place {
  id: number;
  name: string;
  category: string;
  status: string;
  location: string;
  tags: string[];
  createdDate: string;
}

export interface Meta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  returnedCount: number;
  queryTimeMs: number;
  typesenseTimeMs: number;
}

export interface SearchState {
  // filters
  q: string;
  category: string;
  status: string;
  tags: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  limit: number;

  data: Place[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;

  addLoading: boolean;
  addError: string | null;
  addSuccess: boolean;
}
