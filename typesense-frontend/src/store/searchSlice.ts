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

export const addPlace = createAsyncThunk(
  'search/addPlace',
  async (payload: {
    name: string;
    description?: string;
    category: string;
    status: string;
    location: string;
    tags: string;
  }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API}/places`, payload);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message;
      return rejectWithValue(
        Array.isArray(msg) ? msg.join(', ') : msg || err.message || 'Failed to add place'
      );
    }
  },
);

const initialState: SearchState = {
  q: '', category: '', status: '', tags: '',
  location: '', dateFrom: '', dateTo: '',
  page: 1, limit: 20,
  data: [], meta: null, loading: false, error: null,
  addLoading: false,
  addError: null,
  addSuccess: false,
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
    resetAddPlace(state) {
      state.addLoading = false;
      state.addError = null;
      state.addSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPlace.pending, (state) => { state.addLoading = true; state.addError = null; state.addSuccess = false; })
      .addCase(addPlace.fulfilled, (state) => { state.addLoading = false; state.addSuccess = true; })
      .addCase(addPlace.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload as string;
      });
  },
});

export const { setFilter, resetFilters, resetAddPlace } = searchSlice.actions;
export default searchSlice.reducer;
