import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import moment from 'moment';
import 'moment/locale/tr';
import { COLORS, SIZES } from '../constants/theme';
import { HADITHS } from '../constants/hadiths';

moment.locale('tr');

interface Prayer {
  name: string;
  time: string;
}

const { width } = Dimensions.get('window');

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [nextPrayer, setNextPrayer] = useState<Prayer | null>(null);
  const [countdown, setCountdown] = useState('');
  const [hadith, setHadith] = useState({ title: '', text: '' });

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDate(today.toLocaleDateString('tr-TR', options));
    setHadith(HADITHS[Math.floor(Math.random() * HADITHS.length)]);

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
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=12`);
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

  useEffect(() => {
    if (prayerTimes.length > 0) {
      const interval = setInterval(() => {
        const now = moment();
        let nextPrayerTime: moment.Moment | null = null;
        let nextPrayerName = '';

        for (const prayer of prayerTimes) {
          const prayerTime = moment(prayer.time, 'HH:mm');
          if (prayerTime.isAfter(now)) {
            nextPrayerTime = prayerTime;
            nextPrayerName = prayer.name;
            break;
          }
        }

        if (!nextPrayerTime) {
          const tomorrowFajr = moment(prayerTimes[0].time, 'HH:mm').add(1, 'days');
          nextPrayerTime = tomorrowFajr;
          nextPrayerName = prayerTimes[0].name;
        }

        const duration = moment.duration(nextPrayerTime.diff(now));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        setNextPrayer({ name: nextPrayerName, time: nextPrayerTime.format('HH:mm') });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [prayerTimes]);

  let content = <ActivityIndicator size="large" color={COLORS.text} style={styles.loader} />;

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
        {nextPrayer && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>Sonraki Vakit: {nextPrayer.name}</Text>
            <Text style={styles.countdownTimer}>{countdown}</Text>
          </View>
        )}
        <View style={styles.contentContainer}>{content}</View>
        <View style={styles.hadithContainer}>
          <Text style={styles.hadithTitle}>{hadith.title}</Text>
          <Text style={styles.hadithText}>{hadith.text}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  header: {
    width: '100%',
    paddingVertical: SIZES.padding,
    alignItems: 'center',
  },
  headerText: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: SIZES.padding,
  },
  countdownText: {
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
  countdownTimer: {
    fontSize: 50,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  contentContainer: {
    width: '100%',
  },
  prayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prayerName: {
    fontSize: SIZES.h3,
    color: COLORS.text,
  },
  prayerTime: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 50,
    fontSize: SIZES.body,
  },
  loader: {
    marginTop: 50,
  },
  hadithContainer: {
    width: '100%',
    padding: SIZES.padding,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  hadithTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  hadithText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default PrayerTimes;
