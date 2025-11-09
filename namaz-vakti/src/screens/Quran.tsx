import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuranScreenNavigationProp } from '../navigation/types';
import { COLORS, SIZES } from '../constants/theme';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const Quran = ({ navigation }: { navigation: QuranScreenNavigationProp }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('https://api.aladhan.com/v1/surah');
        const data = await response.json();
        setSurahs(data.data);
        setFilteredSurahs(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const searchFilter = (text: string) => {
    if (text) {
      const newData = surahs.filter((item) => {
        const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredSurahs(newData);
      setSearch(text);
    } else {
      setFilteredSurahs(surahs);
      setSearch(text);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={search}
        placeholder="Sure Ara..."
        placeholderTextColor={COLORS.textSecondary}
        onChangeText={(text) => searchFilter(text)}
      />
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Surah', { surahNumber: item.number })}>
            <View style={styles.surahContainer}>
              <Text style={styles.surahName}>{item.number}. {item.name}</Text>
              <Text style={styles.surahDetails}>{item.englishName} - {item.numberOfAyahs} Ayet</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  searchInput: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    paddingHorizontal: 10,
    margin: 10,
    color: COLORS.text,
  },
  surahContainer: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  surahName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  surahDetails: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
});

export default Quran;
