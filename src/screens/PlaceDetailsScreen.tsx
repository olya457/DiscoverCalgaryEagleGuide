import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
  Image,
  LayoutAnimation,
  ScrollView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const PURPLE = '#4D5B94';
const DARK_BG = '#0E0E0E';
const SAVED_KEY = 'saved_places';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetails'>;

function IconButton({
  source,
  onPress,
  style,
}: {
  source: any;
  onPress: () => void;
  style?: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={style}
      hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
    >
      <Image source={source} style={{ width: 40, height: 40 }} resizeMode="contain" />
    </TouchableOpacity>
  );
}

function MapControls({
  mapRef,
  region,
  setRegion,
  reset,
}: {
  mapRef: React.RefObject<MapView | null>;
  region: Region;
  setRegion: (r: Region) => void;
  reset: () => void;
}) {
  const zoom = (dir: 1 | -1) => {
    const next: Region = {
      ...region,
      latitudeDelta: Math.max(0.002, region.latitudeDelta * (dir === 1 ? 0.6 : 1.6)),
      longitudeDelta: Math.max(0.002, region.longitudeDelta * (dir === 1 ? 0.6 : 1.6)),
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next, 220);
  };

  return (
    <View style={styles.controlsCol}>
      <TouchableOpacity style={styles.ctrl} onPress={() => zoom(1)}>
        <Text style={styles.ctrlTxt}>＋</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ctrl} onPress={() => zoom(-1)}>
        <Text style={styles.ctrlTxt}>－</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ctrl} onPress={reset}>
        <Text style={styles.ctrlTxt}>↺</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlaceDetailsScreen({ route, navigation }: Props) {
  const { place } = route.params;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmall = width <= 375 || height <= 667;
  const isLarge = height >= 800;

  const { lat, lng } = useMemo(() => {
    const m = /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/.exec(place.coords);
    const flat = m ? parseFloat(m[1]) : 51.0486;
    const flng = m ? parseFloat(m[2]) : -114.0708;
    return { lat: flat, lng: flng };
  }, [place.coords]);

  const initialRegion: Region = useMemo(
    () => ({ latitude: lat, longitude: lng, latitudeDelta: 0.045, longitudeDelta: 0.045 }),
    [lat, lng]
  );

  const [isSaved, setIsSaved] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [region, setRegion] = useState<Region>(initialRegion);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => setRegion(initialRegion), [initialRegion]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_KEY);
        const list: { title: string; coords: string }[] = raw ? JSON.parse(raw) : [];
        setIsSaved(list.some((p) => p.title === place.title));
      } catch {}
    })();
  }, [place.title]);

  const toggleSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const list: { title: string; coords: string }[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((p) => p.title === place.title);
      if (idx >= 0) {
        list.splice(idx, 1);
        setIsSaved(false);
      } else {
        list.push({ title: place.title, coords: place.coords });
        setIsSaved(true);
      }
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch {}
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `${place.title}\n${place.coords}` });
    } catch {}
  };

  const toggleMap = () => {
    if (Platform.OS !== 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setMapVisible((v) => !v);
  };

  const resetMap = () => {
    setRegion(initialRegion);
    mapRef.current?.animateToRegion(initialRegion, 220);
  };

  const HERO_BASE = isSmall ? 210 : isLarge ? 260 : 230;
  const HERO_H = HERO_BASE + 70;

  const hardCap = isLarge ? 310 : isSmall ? 220 : 260;
  const baseCalc = Math.round(((width - 28 - 24) * 9) / 16);
  const extra30 = Platform.OS === 'android' || isLarge ? 30 : 0;
  const MAP_H = Math.min(hardCap + extra30, baseCalc + extra30);

  const extraBottom =
    insets.bottom +
    (Platform.OS === 'ios'
      ? mapVisible
        ? isLarge
          ? 64
          : isSmall
          ? 40
          : 52
        : isLarge
        ? 36
        : isSmall
        ? 22
        : 28
      : mapVisible
      ? 28
      : 18);

  const TITLE = isLarge ? 18 : 16;
  const DESC = isLarge ? 14.5 : isSmall ? 12.5 : 13.5;
  const BTN_TXT = isLarge ? 16 : 14;
  const BTN_H = isLarge ? 48 : isSmall ? 42 : 46;
  const BTN_RADIUS = 16;

  const CONTENT_TOP_PAD = (isLarge ? 64 : isSmall ? 44 : 56) + 20;
  const HIDE_TOP = isSmall ? 4 : 10;
  const MAP_MARGIN_BOTTOM = isSmall ? 12 : 20;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: Platform.OS !== 'ios' }),
      Animated.timing(slide, { toValue: 0, duration: 420, useNativeDriver: Platform.OS !== 'ios' }),
    ]).start();
  }, [fade, slide, mapVisible, isSaved]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={[styles.header, isSmall && styles.headerSE]}>
          <Image source={require('../assets/loder.png')} style={[styles.logo, isSmall && styles.logoSE]} resizeMode="contain" />
          <Text style={[styles.headerTitle, isSmall && styles.headerTitleSE]}>Recommended places</Text>
        </View>
      </SafeAreaView>

      <View style={styles.heroUnderHeader}>
        <ImageBackground source={place.image} style={[styles.hero, { height: HERO_H }]} resizeMode="cover">
          <View style={styles.heroTopRow}>
            <IconButton source={require('../assets/btn_back.png')} onPress={() => navigation.goBack()} />
            <View style={styles.heroActions}>
              <IconButton source={require('../assets/btn_share.png')} onPress={onShare} />
              <IconButton
                source={
                  isSaved
                    ? require('../assets/btn_fav_filled.png')
                    : require('../assets/btn_fav_outline.png')
                }
                onPress={toggleSave}
              />
            </View>
          </View>
        </ImageBackground>
      </View>

      <Animated.View style={[styles.bodyWrap, { borderTopLeftRadius: 40, borderTopRightRadius: 40, opacity: fade, transform: [{ translateY: slide }] }]}>
        <ScrollView
          contentContainerStyle={[styles.bodyCardContent, { paddingBottom: extraBottom, paddingTop: CONTENT_TOP_PAD }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleRow}>
            <Text style={[styles.title, { fontSize: TITLE }]} numberOfLines={2}>
              {place.title}
            </Text>
          </View>

          <Text style={styles.coords} numberOfLines={1}>
            📍 {place.coords.replace('📍', '').trim()}
          </Text>

          {!mapVisible && (
            <>
              <Text style={[styles.desc, { fontSize: DESC }]}>
                An architectural ensemble and one of Calgary’s beloved spots. Here you can enjoy scenic views, learn history & culture, and plan your walk. (Add a real description later.)
              </Text>

              <TouchableOpacity
                onPress={toggleMap}
                activeOpacity={0.9}
                style={[styles.mapBtn, { height: BTN_H, borderRadius: BTN_RADIUS, alignSelf: 'center' }]}
              >
                <Text style={[styles.mapBtnTxt, { fontSize: BTN_TXT }]}>Open map</Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
            </>
          )}

          {mapVisible && (
            <>
              <View style={[styles.mapWrap, { height: MAP_H, marginBottom: MAP_MARGIN_BOTTOM }]}>
                <MapView
                  ref={mapRef}
                  style={StyleSheet.absoluteFill}
                  initialRegion={initialRegion}
                  region={region}
                  onRegionChangeComplete={setRegion}
                >
                  <Marker coordinate={{ latitude: lat, longitude: lng }} title={place.title} />
                </MapView>
                <MapControls mapRef={mapRef} region={region} setRegion={setRegion} reset={resetMap} />
              </View>

              <TouchableOpacity
                onPress={toggleMap}
                activeOpacity={0.9}
                style={[styles.mapBtn, { height: BTN_H, borderRadius: BTN_RADIUS, alignSelf: 'center', marginTop: HIDE_TOP }]}
              >
                <Text style={[styles.mapBtnTxt, { fontSize: BTN_TXT }]}>Hide map</Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
            </>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  headerSafe: {
    backgroundColor: PURPLE,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },
  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.select({ ios: 6, android: 10 }),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSE: { paddingBottom: 10, paddingTop: Platform.select({ ios: 4, android: 8 }) },
  logo: { width: 80, height: 65 },
  logoSE: { width: 72, height: 58 },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginRight: 92,
  },
  headerTitleSE: { fontSize: 18, marginRight: 80 },
  heroUnderHeader: {
    marginTop: -20,
    marginBottom: -80,
    zIndex: 1,
  },
  hero: { width: '100%', justifyContent: 'flex-start' },
  heroTopRow: {
    marginTop: 30,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroActions: { flexDirection: 'row', gap: 10 },
  bodyWrap: { flex: 1, backgroundColor: PURPLE, overflow: 'hidden' },
  bodyCardContent: { paddingHorizontal: 14 },
  titleRow: { marginBottom: 6 },
  title: { color: '#fff', fontWeight: '800' },
  coords: { color: '#D5E2FF', marginBottom: 10 },
  desc: { color: 'rgba(255,255,255,0.92)', lineHeight: 20, marginBottom: 14 },
  mapBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  mapBtnTxt: { color: '#1B1B1B', fontWeight: '800' },
  mapWrap: { borderRadius: 18, overflow: 'hidden', backgroundColor: '#000' },
  controlsCol: {
    position: 'absolute',
    right: 10,
    top: 10,
    alignItems: 'center',
    gap: 8,
  },
  ctrl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
