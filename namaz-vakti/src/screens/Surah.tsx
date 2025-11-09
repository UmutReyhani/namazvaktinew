import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface Ayah {
  number: number;
  text: string;
}

const Surah = ({ route }) => {
  const { surahNumber } = route.params;
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`https://api.aladhan.com/v1/surah/${surahNumber}`);
        const data = await response.json();
        setAyahs(data.data.ayahs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ayahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <View style={styles.ayahContainer}>
            <Text style={styles.ayahText}>{item.number}. {item.text}</Text>
          </View>
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
  ayahContainer: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ayahText: {
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
});

export default Surah;
