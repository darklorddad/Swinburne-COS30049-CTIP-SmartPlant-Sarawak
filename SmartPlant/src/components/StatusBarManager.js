import { Platform, StatusBar } from 'react-native';

export const TOP_PAD = Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 0) + 4;
export const EXTRA_TOP_SPACE = 12;
