import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  currency: {
    code: string;
    exchangeRate: number;
  };
  alerts: {
    id: string;
    coinId: string;
    targetPrice: number;
    condition: 'above' | 'below';
    active: boolean;
    currency: string;
  }[];
}

const initialState: UiState = {
  currency: {
    code: 'usd',
    exchangeRate: 1.0,
  },
  alerts: [],
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
    addAlert: (state, action: PayloadAction<UiState['alerts'][0]>) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter((alert) => alert.id !== action.payload);
    },
    toggleAlert: (state, action: PayloadAction<string>) => {
      // action.payload -> ID alert
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.active = !alert.active;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCurrency, addAlert, removeAlert, toggleAlert } = uiSlice.actions;

export default uiSlice.reducer;
