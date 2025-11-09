import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const Qibla = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni reddedildi');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      Location.watchHeadingAsync((heading) => {
        setHeading(heading.trueHeading);
      });
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const { latitude, longitude } = location.coords;
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const latRad = (latitude * Math.PI) / 180;
      const lngRad = (longitude * Math.PI) / 180;
      const kaabaLatRad = (kaabaLat * Math.PI) / 180;
      const kaabaLngRad = (kaabaLng * Math.PI) / 180;

      const y = Math.sin(kaabaLngRad - lngRad);
      const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);
      let brng = Math.atan2(y, x);
      brng = (brng * 180) / Math.PI;
      brng = (brng + 360) % 360;

      setQiblaDirection(brng);
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={styles.text}>Kıble yönü hesaplanıyor...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Kıble</Text>
      <View style={{ transform: [{ rotate: `${360 - heading}deg` }] }}>
        <Ionicons name="arrow-up-circle" size={200} color={COLORS.text} style={{ transform: [{ rotate: `${qiblaDirection}deg` }] }} />
      </View>
      <Text style={styles.text}>{Math.round(qiblaDirection)}°</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  text: {
    color: COLORS.text,
    fontSize: SIZES.h2,
    marginTop: SIZES.padding,
  },
  errorText: {
    color: COLORS.accent,
    textAlign: 'center',
    fontSize: SIZES.h3,
  },
});

export default Qibla;
