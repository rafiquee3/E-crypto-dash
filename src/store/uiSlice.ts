import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
  currency: string
}

const initialState: UiState = {
  currency: 'usd',
}

export const counterSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.currency = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCurrency } = counterSlice.actions;

export default counterSlice.reducer;