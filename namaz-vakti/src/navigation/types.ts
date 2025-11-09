import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Quran: undefined;
  Surah: { surahNumber: number };
};

export type QuranScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Surah'>;
export type SurahScreenRouteProp = RouteProp<RootStackParamList, 'Surah'>;
