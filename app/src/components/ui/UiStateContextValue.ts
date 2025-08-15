import { createContext } from 'react';
import type { UiState } from './UiStateContext';

export const UiStateContext = createContext<UiState | undefined>(undefined);
