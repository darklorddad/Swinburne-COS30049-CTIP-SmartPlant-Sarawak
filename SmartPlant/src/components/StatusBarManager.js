import { Platform, StatusBar } from 'react-native';

export const TOP_PAD = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight || 0) + 8;
export const EXTRA_TOP_SPACE = 18;