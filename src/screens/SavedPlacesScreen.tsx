import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  Share,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { Place } from './RecommendedPlacesScreen';

const COLOR_PURPLE = '#4D5B94';
const COLOR_DARK = '#0E0E0E';
const STORAGE_KEY_SAVED = 'saved_places';

type NavigationType = NativeStackNavigationProp<RootStackParamList, 'PlaceDetails'>;

const CATEGORY_LIST = ['Nature', 'Culture', 'Entertainment'] as const;
type CategoryType = typeof CATEGORY_LIST[number];

type CatalogItemType = Place & { category: CategoryType };

const CATALOG: CatalogItemType[] = [
  {
    title: "Prince’s Island Park",
    coords: '📍 51.0533, -114.0713',
    image: require('../assets/nature_princes_island.png'),
    category: 'Nature',
    description:
      'Green island on the Bow River with bridges, paths, ponds and festivals in summer; a quiet snowy oasis in winter.',
  },
  {
    title: 'Nose Hill Park',
    coords: '📍 51.1061, -114.1110',
    image: require('../assets/nature_nose_hill.png'),
    category: 'Nature',
    description:
      'One of North America’s largest urban parks: prairie landscapes, wildlife and sweeping views of Calgary and the Rockies.',
  },
  {
    title: 'Bowness Park',
    coords: '📍 51.0837, -114.2158',
    image: require('../assets/nature_bowness.png'),
    category: 'Nature',
    description:
      'Historic riverside park with a lagoon for boating in summer and a popular ice rink in winter, plus picnic and BBQ areas.',
  },
  {
    title: 'Heritage Park Historical Village',
    coords: '📍 50.9936, -114.1082',
    image: require('../assets/culture_heritage_park.png'),
    category: 'Culture',
    description:
      'Canada’s largest open-air museum recreating 19th–20th century Western Canada with streets, shops and a steam train.',
  },
  {
    title: 'Studio Bell – National Music Centre',
    coords: '📍 51.0455, -114.0504',
    image: require('../assets/culture_studio_bell.png'),
    category: 'Culture',
    description:
      'Modern cultural hub for Canadian and global music: interactive exhibits, rare instruments, studios and performance spaces.',
  },
  {
    title: 'Glenbow Museum',
    coords: '📍 51.0446, -114.0633',
    image: require('../assets/culture_glenbow.png'),
    category: 'Culture',
    description:
      'Major museum with over a million artifacts spanning art, Indigenous cultures and history; newly refreshed exhibition spaces.',
  },
  {
    title: 'Calgary Tower',
    coords: '📍 51.0449, -114.0631',
    image: require('../assets/ent_tower.png'),
    category: 'Entertainment',
    description:
      '191-metre city icon with glass-floor views across Calgary and the Rockies; colourful lighting after dusk.',
  },
  {
    title: 'Scotiabank Saddledome',
    coords: '📍 51.0374, -114.0519',
    image: require('../assets/ent_saddledome.png'),
    category: 'Entertainment',
    description:
      'Olympic-era arena and home of the Calgary Flames; hosts major concerts and events under its unique saddle-shaped roof.',
  },
  {
    title: 'Calgary Stampede Grounds',
    coords: '📍 51.0370, -114.0528',
    image: require('../assets/ent_stampede.png'),
    category: 'Entertainment',
    description:
      'Legendary venue of the Calgary Stampede—ten days of rodeo, races, concerts and fairs; active year-round for big events.',
  },
];

type SavedPlaceType = { title: string; coords: string };

export default function SavedPlacesScreen() {
  const navigation = useNavigation<NavigationType>();
  const { width, height } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Nature');
  const [savedList, setSavedList] = useState<SavedPlaceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSmallScreen = width <= 375 || height <= 667;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  const runAppear = useCallback(() => {
    fade.setValue(0);
    slide.setValue(12);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  const loadSaved = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_SAVED);
      const list: SavedPlaceType[] = raw ? JSON.parse(raw) : [];
      setSavedList(list);
    } catch {
      setSavedList([]);
    } finally {
      setIsLoading(false);
      runAppear();
    }
  }, [runAppear]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [loadSaved])
  );

  const hydratedList: CatalogItemType[] = useMemo(() => {
    const titleSet = new Set(savedList.map((s) => s.title));
    return CATALOG.filter((c) => titleSet.has(c.title));
  }, [savedList]);

  const dataForCategory = useMemo(
    () => hydratedList.filter((p) => p.category === activeCategory),
    [hydratedList, activeCategory]
  );

  const onOpenDetails = (place: Place) => {
    navigation.navigate('PlaceDetails', { place });
  };

  const onUnsave = async (title: string) => {
    try {
      const list = savedList.filter((s) => s.title !== title);
      await AsyncStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(list));
      setSavedList(list);
    } catch {}
  };

  const onShare = async (place: Place) => {
    try {
      await Share.share({ message: `${place.title}\n${place.coords}` });
    } catch {}
  };

  const H_PADDING = 16;
  const GAP = 12;
  const TARGET_W = 170;
  const TARGET_H = 250;
  const availablePerColumn = Math.floor((width - H_PADDING * 2 - GAP) / 2);
  const cardWidth = Math.min(TARGET_W, availablePerColumn);
  const cardHeight = Math.round((TARGET_H / TARGET_W) * cardWidth);

  const renderItem = ({ item }: { item: CatalogItemType }) => (
    <CardItem
      place={item}
      width={cardWidth}
      height={cardHeight}
      onPress={() => onOpenDetails(item)}
      onUnsave={() => onUnsave(item.title)}
      onShare={() => onShare(item)}
      isSmallScreen={isSmallScreen}
    />
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
          <Image
            source={require('../assets/loder.png')}
            style={[styles.logo, isSmallScreen && styles.logoSmall]}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>
            Saved places
          </Text>
        </View>
      </SafeAreaView>

      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
        <View style={styles.chipsRow}>
          {CATEGORY_LIST.map((category) => {
            const isActive = category === activeCategory;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => {
                  setActiveCategory(category);
                  runAppear();
                }}
                activeOpacity={0.85}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isActive && styles.chipTextOn,
                    isSmallScreen && styles.chipTextSmall,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!isLoading && dataForCategory.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, isSmallScreen && styles.emptyTextSmall]}>
              You have no saved locations for this category yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={dataForCategory}
            renderItem={renderItem}
            keyExtractor={(it) => it.title}
            numColumns={2}
            columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
            ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
  );
}

function CardItem({
  place,
  width,
  height,
  onPress,
  onUnsave,
  onShare,
  isSmallScreen,
}: {
  place: Place;
  width: number;
  height: number;
  onPress: () => void;
  onUnsave: () => void;
  onShare: () => void;
  isSmallScreen: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, { width }]}>
      <ImageBackground
        source={place.image}
        style={[styles.cardImage, { height }]}
        imageStyle={styles.cardImageRadius}
      >
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onShare} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Image
              source={require('../assets/btn_share.png')}
              style={[styles.cardActionIcon, isSmallScreen && styles.cardActionIconSmall]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onUnsave} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Image
              source={require('../assets/btn_fav_filled.png')}
              style={[styles.cardActionIcon, isSmallScreen && styles.cardActionIconSmall]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardOverlay}>
          <Text style={[styles.cardTitle, isSmallScreen && styles.cardTitleSmall]} numberOfLines={1}>
            {place.title}
          </Text>
          <Text style={[styles.cardCoords, isSmallScreen && styles.cardCoordsSmall]} numberOfLines={1}>
            {place.coords}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR_DARK },

  headerSafe: {
    backgroundColor: COLOR_PURPLE,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLOR_PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: Platform.select({ ios: 6, android: 12 }),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSmall: {
    paddingBottom: 10,
    paddingTop: Platform.select({ ios: 4, android: 8 }),
  },
  logo: { width: 80, height: 65 },
  logoSmall: { width: 72, height: 58 },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginRight: 92,
  },
  headerTitleSmall: { fontSize: 18, marginRight: 80 },

  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2F3A6B',
  },
  chipActive: { backgroundColor: '#FFFFFF' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12 },
  chipTextSmall: { fontSize: 11 },
  chipTextOn: { color: '#1B1B1B' },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 14 },
  emptyTextSmall: { fontSize: 13 },

  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLOR_PURPLE,
  },
  cardImage: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  cardImageRadius: { borderRadius: 18 },
  cardOverlay: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.44)',
  },
  cardTitle: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
  cardTitleSmall: { fontSize: 12.5 },
  cardCoords: { color: '#D5E2FF', fontSize: 11, marginTop: 2 },
  cardCoordsSmall: { fontSize: 10.5 },

  cardActions: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  cardActionIcon: { width: 24, height: 24, tintColor: '#fff' },
  cardActionIconSmall: { width: 22, height: 22 },
});

export {};
