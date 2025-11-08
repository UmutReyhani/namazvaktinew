import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';

interface Prayer {
  name: string;
  time: string;
}

const { width } = Dimensions.get('window');

export default function App() {
  const [prayerTimes, setPrayerTimes] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDate(today.toLocaleDateString('tr-TR', options));

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni reddedildi');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3`);
        const data = await response.json();
        const timings = data.data.timings;
        const prayerTimesData = [
          { name: 'İmsak', time: timings.Fajr },
          { name: 'Güneş', time: timings.Sunrise },
          { name: 'Öğle', time: timings.Dhuhr },
          { name: 'İkindi', time: timings.Asr },
          { name: 'Akşam', time: timings.Maghrib },
          { name: 'Yatsı', time: timings.Isha },
        ];
        setPrayerTimes(prayerTimesData);
      } catch (error) {
        console.error(error);
        setErrorMsg('Namaz vakitleri alınamadı.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  let content = <ActivityIndicator size="large" color="#fff" style={styles.loader} />;

  if (!loading) {
    if (errorMsg) {
      content = <Text style={styles.errorText}>{errorMsg}</Text>;
    } else {
      content = prayerTimes.map((prayer, index) => (
        <View key={index} style={styles.prayerContainer}>
          <Text style={styles.prayerName}>{prayer.name}</Text>
          <Text style={styles.prayerTime}>{prayer.time}</Text>
        </View>
      ));
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Namaz Vakti</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.contentContainer}>{content}</View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  header: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: width * 0.04,
    color: '#aaa',
    marginTop: 5,
  },
  contentContainer: {
    width: '100%',
  },
  prayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  prayerName: {
    fontSize: width * 0.05,
    color: '#fff',
  },
  prayerTime: {
    fontSize: width * 0.05,
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 50,
    fontSize: width * 0.045,
  },
  loader: {
    marginTop: 50,
  },
});
