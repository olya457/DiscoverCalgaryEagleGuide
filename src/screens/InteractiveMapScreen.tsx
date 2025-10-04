import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, LatLng, MapViewProps } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Place } from './RecommendedPlacesScreen';

const COLOR_PURPLE = '#4D5B94';
const COLOR_DARK_BACKGROUND = '#0E0E0E';

type NavigationType = NativeStackNavigationProp<RootStackParamList, 'PlaceDetails'>;

const CATEGORY_LIST = ['Nature', 'Culture', 'Entertainment'] as const;
type CategoryType = typeof CATEGORY_LIST[number];

type CatalogItemType = Place & { category: CategoryType };

const CATALOG_DATA: CatalogItemType[] = [
  {
    title: "Prince’s Island Park",
    coords: '📍 51.0533, -114.0713',
    image: require('../assets/nature_princes_island.png'),
    category: 'Nature',
    description: '…',
  },
  {
    title: 'Nose Hill Park',
    coords: '📍 51.1061, -114.1110',
    image: require('../assets/nature_nose_hill.png'),
    category: 'Nature',
    description: '…',
  },
  {
    title: 'Bowness Park',
    coords: '📍 51.0837, -114.2158',
    image: require('../assets/nature_bowness.png'),
    category: 'Nature',
    description: '…',
  },
  {
    title: 'Heritage Park Historical Village',
    coords: '📍 50.9936, -114.1082',
    image: require('../assets/culture_heritage_park.png'),
    category: 'Culture',
    description: '…',
  },
  {
    title: 'Studio Bell – National Music Centre',
    coords: '📍 51.0455, -114.0504',
    image: require('../assets/culture_studio_bell.png'),
    category: 'Culture',
    description: '…',
  },
  {
    title: 'Glenbow Museum',
    coords: '📍 51.0446, -114.0633',
    image: require('../assets/culture_glenbow.png'),
    category: 'Culture',
    description: '…',
  },
  {
    title: 'Calgary Tower',
    coords: '📍 51.0449, -114.0631',
    image: require('../assets/ent_tower.png'),
    category: 'Entertainment',
    description: '…',
  },
  {
    title: 'Scotiabank Saddledome',
    coords: '📍 51.0374, -114.0519',
    image: require('../assets/ent_saddledome.png'),
    category: 'Entertainment',
    description: '…',
  },
  {
    title: 'Calgary Stampede Grounds',
    coords: '📍 51.0370, -114.0528',
    image: require('../assets/ent_stampede.png'),
    category: 'Entertainment',
    description: '…',
  },
];

const parseCoordinatesFromString = (coordinatesString: string): LatLng | null => {
  const match = coordinatesString.match(/-?\d+(?:\.\d+)?/g);
  if (!match || match.length < 2) return null;
  const parsedLatitude = parseFloat(match[0]);
  const parsedLongitude = parseFloat(match[1]);
  if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) return null;
  return { latitude: parsedLatitude, longitude: parsedLongitude };
};

export default function InteractiveMapScreen() {
  const navigation = useNavigation<NavigationType>();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const isSmallScreen = windowDimensions.width <= 375 || windowDimensions.height <= 667;

  const [activeCategory, setActiveCategory] = useState<CategoryType>('Nature');
  const [previewItem, setPreviewItem] = useState<CatalogItemType | null>(null);
  const [iosMarkerTracksViewChanges, setIosMarkerTracksViewChanges] = useState<boolean>(Platform.OS === 'ios');

  const mapViewRef = useRef<MapView | null>(null);
  const isMapReadyRef = useRef(false);
  const areTilesLoadedRef = useRef(false);

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(12)).current;

  const filteredItems = useMemo(() => CATALOG_DATA.filter(item => item.category === activeCategory), [activeCategory]);
  const coordinatesList = useMemo(
    () => filteredItems.map(item => parseCoordinatesFromString(item.coords)).filter(Boolean) as LatLng[],
    [filteredItems]
  );

  const defaultCenterCoordinate = { latitude: 51.0449, longitude: -114.0631 };

  const initialMapRegion = useMemo(() => {
    const centerCoordinate = coordinatesList[0] ?? defaultCenterCoordinate;
    return {
      latitude: centerCoordinate.latitude,
      longitude: centerCoordinate.longitude,
      latitudeDelta: 0.25,
      longitudeDelta: 0.25,
    };
  }, [coordinatesList]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnimation, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fadeAnimation, slideAnimation, activeCategory]);

  const fitAllCurrentCoordinates = useCallback(() => {
    if (!mapViewRef.current) return;
    if (coordinatesList.length === 0) return;
    if (Platform.OS === 'ios') {
      mapViewRef.current.fitToCoordinates(coordinatesList, {
        edgePadding: { top: 80, right: 36, bottom: 120, left: 36 },
        animated: true,
      });
      return;
    }
    if (!isMapReadyRef.current || !areTilesLoadedRef.current) return;
    mapViewRef.current.fitToCoordinates(coordinatesList, {
      edgePadding: { top: 80, right: 36, bottom: 120, left: 36 },
      animated: true,
    });
  }, [coordinatesList]);

  useEffect(() => {
    setPreviewItem(null);
    if (Platform.OS === 'ios') {
      setIosMarkerTracksViewChanges(true);
      requestAnimationFrame(() => {
        fitAllCurrentCoordinates();
        setTimeout(() => setIosMarkerTracksViewChanges(false), 500);
      });
    } else {
      fitAllCurrentCoordinates();
    }
  }, [fitAllCurrentCoordinates, activeCategory]);

  const handleMapReady: MapViewProps['onMapReady'] = () => {
    isMapReadyRef.current = true;
    if (Platform.OS === 'ios') {
      areTilesLoadedRef.current = true;
    }
    fitAllCurrentCoordinates();
  };

  const handleMapLoaded: MapViewProps['onMapLoaded'] = () => {
    areTilesLoadedRef.current = true;
    requestAnimationFrame(() => fitAllCurrentCoordinates());
  };

  const openPlaceDetails = (item: CatalogItemType) => navigation.navigate('PlaceDetails', { place: item });

  const handleMarkerPress = (item: CatalogItemType) => {
    const coordinate = parseCoordinatesFromString(item.coords);
    if (coordinate && mapViewRef.current) {
      mapViewRef.current.animateToRegion(
        { ...coordinate, latitudeDelta: 0.08, longitudeDelta: 0.08 },
        450
      );
    }
    setPreviewItem(item);
  };

  const previewScale = Math.min(1, (windowDimensions.width - 32) / 200);
  const previewWidth = Math.round(200 * previewScale);
  const previewHeight = Math.round(300 * previewScale);
  const bottomSafeOffset = safeAreaInsets.bottom + (isSmallScreen ? 84 : 96);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={[styles.headerContainer, isSmallScreen && styles.headerContainerSmall]}>
          <Image source={require('../assets/loder.png')} style={[styles.headerLogo, isSmallScreen && styles.headerLogoSmall]} resizeMode="contain" />
          <Text style={[styles.headerTitleText, isSmallScreen && styles.headerTitleTextSmall]}>Interactive map</Text>
        </View>
      </SafeAreaView>

      <View style={[styles.categoryChipsRow, isSmallScreen && styles.categoryChipsRowSmall]}>
        {CATEGORY_LIST.map(categoryItem => {
          const isActive = categoryItem === activeCategory;
          return (
            <TouchableOpacity
              key={categoryItem}
              style={[styles.categoryChip, isActive && styles.categoryChipActive, isSmallScreen && styles.categoryChipSmall]}
              activeOpacity={0.85}
              onPress={() => setActiveCategory(categoryItem)}
            >
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive, isSmallScreen && styles.categoryChipTextSmall]}>{categoryItem}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View style={[styles.mapContainer, { opacity: fadeAnimation, transform: [{ translateY: slideAnimation }] }]}>
        <MapView
          ref={mapViewRef}
          style={styles.mapView}
          mapType="standard"
          initialRegion={initialMapRegion}
          onMapReady={handleMapReady}
          onMapLoaded={handleMapLoaded}
          key={Platform.OS === 'ios' ? `ios-map-${activeCategory}` : undefined}
        >
          {filteredItems.map(catalogItem => {
            const coordinate = parseCoordinatesFromString(catalogItem.coords);
            if (!coordinate) return null;
            return (
              <Marker
                key={catalogItem.title}
                coordinate={coordinate}
                onPress={() => handleMarkerPress(catalogItem)}
                tracksViewChanges={Platform.OS === 'ios' ? iosMarkerTracksViewChanges : undefined}
                identifier={Platform.OS === 'ios' ? `ios-marker-${catalogItem.title}` : undefined}
              />
            );
          })}
        </MapView>

        {previewItem && (
          <TouchableWithoutFeedback onPress={() => setPreviewItem(null)}>
            <View style={styles.overlayTouchable} pointerEvents="auto">
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => openPlaceDetails(previewItem)}
                style={[
                  styles.previewCardWrapper,
                  {
                    width: previewWidth,
                    height: previewHeight,
                    bottom: bottomSafeOffset,
                    marginLeft: isSmallScreen ? 12 : 16,
                  },
                ]}
              >
                <ImageBackground
                  source={previewItem.image}
                  style={{ width: '100%', height: '100%' }}
                  imageStyle={{ borderRadius: 16 }}
                  resizeMode="cover"
                >
                  <View style={styles.previewCardOverlay}>
                    <Text style={[styles.previewTitleText, isSmallScreen && styles.previewTitleTextSmall]} numberOfLines={1}>
                      {previewItem.title}
                    </Text>
                    <Text style={[styles.previewCoordinatesText, isSmallScreen && styles.previewCoordinatesTextSmall]} numberOfLines={1}>
                      {previewItem.coords}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR_DARK_BACKGROUND },
  headerSafeArea: {
    backgroundColor: COLOR_PURPLE,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  headerContainer: {
    backgroundColor: COLOR_PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: Platform.select({ ios: 6, android: 12 }),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerContainerSmall: { paddingBottom: 10, paddingTop: Platform.select({ ios: 4, android: 8 }) },
  headerLogo: { width: 80, height: 65 },
  headerLogoSmall: { width: 72, height: 58 },
  headerTitleText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginRight: 92,
  },
  headerTitleTextSmall: { fontSize: 18, marginRight: 80 },
  categoryChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipsRowSmall: { paddingVertical: 8 },
  categoryChip: {
    flexBasis: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2F3A6B',
  },
  categoryChipSmall: { paddingVertical: 9 },
  categoryChipActive: { backgroundColor: '#FFFFFF' },
  categoryChipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  categoryChipTextSmall: { fontSize: 11 },
  categoryChipTextActive: { color: '#1B1B1B' },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  previewCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewCardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.44)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  previewTitleText: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
  previewTitleTextSmall: { fontSize: 13 },
  previewCoordinatesText: { color: '#D5E2FF', fontSize: 11, marginTop: 2 },
  previewCoordinatesTextSmall: { fontSize: 10.5 },
});

export {};
