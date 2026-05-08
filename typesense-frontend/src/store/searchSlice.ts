import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { SearchState } from '../types';

const API = 'http://localhost:3000';

export const fetchResults = createAsyncThunk(
  'search/fetchResults',
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(params)) {
        if (v !== '' && v !== null && v !== undefined) clean[k] = v;
      }
      const res = await axios.get(`${API}/search`, { params: clean });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Search failed');
    }
  },
);

const initialState: SearchState = {
  q: '', category: '', status: '', tags: '',
  location: '', dateFrom: '', dateTo: '',
  page: 1, limit: 20,
  data: [], meta: null, loading: false, error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<{ key: keyof SearchState; value: any }>) {
      (state as any)[action.payload.key] = action.payload.value;
      if (action.payload.key !== 'page') state.page = 1;
    },
    resetFilters(state) {
      Object.assign(state, {
        q: '', category: '', status: '', tags: '',
        location: '', dateFrom: '', dateTo: '',
        sortBy: 'createdDate', sortOrder: 'desc', page: 1,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.data    = action.payload.data;
        state.meta    = action.payload.meta;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { setFilter, resetFilters } = searchSlice.actions;
export default searchSlice.reducer;
