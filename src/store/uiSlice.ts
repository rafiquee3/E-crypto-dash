import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  currency: {
    code: string;
    exchangeRate: number;
  };
}

const initialState: UiState = {
  currency: {
    code: 'usd',
    exchangeRate: 1.0,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<{ code: string; exchangeRate: number }>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.currency = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrency } = uiSlice.actions;

export default uiSlice.reducer;
