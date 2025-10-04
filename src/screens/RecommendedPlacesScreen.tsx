import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  SafeAreaView,
  Platform,
  Share,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 

const PURPLE = '#4D5B94';
const DARK_BG = '#0E0E0E';

const FACTS = [
  'Calgary is known as “Cowtown” for its cowboy heritage.',
  'It is home to the Calgary Stampede, a world-class rodeo festival.',
  'The city has over 333 days of sunshine a year.',
  'The Calgary Tower is a landmark with an observation deck.',
  'The Bow River divides the city in two.',
  'Calgary is the gateway to the Rocky Mountains.',
  'It is home to Heritage Park, Canada’s largest open-air historical museum.',
  'The city is home to over 30 museums.',
  'Calgary hosted the 1988 Winter Olympics.',
  'The city has over 5,000 restaurants.',
  'Calgary is one of the largest cities in Canada by area.',
  'The city has over 8,000 hectares of parks.',
  'Prince’s Island Park is located right in the city center.',
  'Calgary has a modern C-Train light rail system.',
  'It is home to the Calgary Zoo with over 1,000 species of animals.',
  'The city is named after a village in Scotland.',
  'Calgary is one of the largest centers of the oil industry in Canada.',
  'The local NHL hockey club is the Calgary Flames.',
  'Calgary is one of the most multicultural cities in Canada.',
  'In winter, temperatures can drop below −30 °C.',
  'Calgary is famous for the Chinook — a warm wind that can rapidly raise temperatures.',
  'Stephen Avenue Walk is the main pedestrian street with cafés and shops.',
  'The city has over 100 art galleries.',
  'The Calgary Folk Music Festival takes place here.',
  'Downtown features the unique Peace Bridge by Santiago Calatrava.',
  'Calgary has Canada’s largest system of pedestrian skywalks — the +15.',
  'The city sits at an elevation of over 1,000 m above sea level.',
  'Calgary ranks among the world’s cities with the highest standard of living.',
  'The city grew rapidly during the 20th-century oil boom.',
  'Many films and TV series are shot in Calgary, including “The Last of Us”.',
  'The city has over 20 theatres.',
  "Studio Bell is Canada’s National Music Centre.",
  'Calgary is served by YYC Calgary International Airport.',
  'Over 1.6 million people live in the Calgary metropolitan area.',
  'City parks contain more than 200,000 trees.',
  'Calgary is a major winter sports hub.',
  'The city often hosts international business forums.',
  'Calgary is famous for its steakhouse cuisine.',
  'Numerous street-food festivals are held throughout the year.',
  'Calgary has its own professional soccer team, Cavalry FC.',
  'There are 1,000+ km of cycling paths and routes.',
  'Calgary has a large Chinese community and its own Chinatown.',
  'It is home to the University of Calgary.',
  'The skyline features many modern skyscrapers, including The Bow Tower.',
  'Calgary is known for its cleanliness and green spaces.',
  'Fort Calgary marks the historic site of the city’s founding.',
  'Winter in Calgary is often windy.',
  'Local farmers’ markets are very popular.',
  'Calgary is frequently called the “energy capital of Canada”.',
  'It is one of the fastest-growing cities in Canada.',
];

export type Place = {
  title: string;
  coords: string;
  image: any;
  description: string; 
};

const DATA: Record<'Nature' | 'Culture' | 'Entertainment', Place[]> = {
  Nature: [
    {
      title: "Prince’s Island Park",
      coords: '📍 51.0533, -114.0713',
      image: require('../assets/nature_princes_island.png'),
      description:
        "A green island on the Bow River right in downtown Calgary, linked to the city by several pedestrian bridges. You'll find walking paths, bike trails, ponds and picnic areas. In summer it becomes a stage for festivals like the Calgary Folk Music Festival; in winter it turns into a calm, snow-covered oasis perfect for a quiet stroll.",
    },
    {
      title: 'Nose Hill Park',
      coords: '📍 51.1061, -114.1110',
      image: require('../assets/nature_nose_hill.png'),
      description:
        "One of North America’s largest urban parks (over 11 km²). A natural prairie landscape with meadows and native flora and fauna. Hikes reward you with panoramic views of downtown and the far-off Rockies. Deer, coyotes and birds of prey are often spotted. Ideal for hiking and experiencing wilderness inside the city.",
    },
    {
      title: 'Bowness Park',
      coords: '📍 51.0837, -114.2158',
      image: require('../assets/nature_bowness.png'),
      description:
        "A historic family park with more than a century of memories. In summer you can rent pedal boats, canoes and enjoy the large lagoon; in winter it hosts one of the city’s most beloved outdoor skating areas. Picnic sites, BBQs, playgrounds and riverfront paths make it a local favorite year-round.",
    },
  ],
  Culture: [
    {
      title: 'Heritage Park Historical Village',
      coords: '📍 50.9936, -114.1082',
      image: require('../assets/culture_heritage_park.png'),
      description:
        "Canada’s largest living-history museum recreating life in Western Canada from the 1860s to the mid-1900s. Stroll through historic streets, ride a working steam train, visit old-time shops and interact with costumed interpreters. It’s full immersion into the region’s past and a must-see for first-time visitors.",
    },
    {
      title: 'Studio Bell – National Music Centre',
      coords: '📍 51.0455, -114.0504',
      image: require('../assets/culture_studio_bell.png'),
      description:
        "A striking contemporary complex dedicated to music in Canada and beyond. Inside you’ll find interactive galleries, recording studios, rare instruments and performance spaces. Learn about Canadian music legends and even try playing selected instruments yourself — a hit for music lovers and families.",
    },
    {
      title: 'Glenbow Museum',
      coords: '📍 51.0446, -114.0633',
      image: require('../assets/culture_glenbow.png'),
      description:
        "One of Western Canada’s largest museums, home to more than a million artifacts. Collections span Canadian and European art, Indigenous cultures, archival documents and historic objects. After a major renovation, Glenbow has reopened as a modern venue for exhibitions, talks and cultural events.",
    },
  ],
  Entertainment: [
    {
      title: 'Calgary Tower',
      coords: '📍 51.0449, -114.0631',
      image: require('../assets/ent_tower.png'),
      description:
        "A signature 191-metre observation tower with a glass-floor experience and sweeping views of the skyline, Bow River and distant Rockies. At night the tower glows with colourful lighting. It’s an essential stop for first-timers and a great photo spot.",
    },
    {
      title: 'Scotiabank Saddledome',
      coords: '📍 51.0374, -114.0519',
      image: require('../assets/ent_saddledome.png'),
      description:
        "An Olympic-era arena famous for its saddle-shaped roof. Today it hosts Calgary Flames hockey games, arena concerts and major shows. Whether you’re here for sports or live music, the venue is a city icon.",
    },
    {
      title: 'Calgary Stampede Grounds',
      coords: '📍 51.0370, -114.0528',
      image: require('../assets/ent_stampede.png'),
      description:
        "The home of the legendary Calgary Stampede — the world’s biggest rodeo and a 10-day city-wide celebration every July with shows, chuckwagon races, concerts and fairs. Outside the festival, the grounds host trade shows and entertainment events year-round.",
    },
  ],
};

const CATEGORIES = ['Nature', 'Culture', 'Entertainment'] as const;
type Category = typeof CATEGORIES[number];

const getRandomFact = () => FACTS[Math.floor(Math.random() * FACTS.length)];

export default function RecommendedPlacesScreen() {
  const navigation = useNavigation<any>();
  const { width, height } = useWindowDimensions();
  const [fact, setFact] = useState('');
  const [activeCat, setActiveCat] = useState<Category>('Nature');

  const isSE = width <= 375 || height <= 667;

  useFocusEffect(
    useCallback(() => {
      setFact(getRandomFact());
    }, [])
  );


  const onShare = useCallback(async () => {
    try { await Share.share({ message: fact }); } catch {}
  }, [fact]);

  const CARD_W = isSE ? Math.round(width * 0.72)
                      : Math.min(340, Math.max(270, Math.round(width * 0.68)));
  const GAP = 12;

  const openDetails = (place: Place) => {
    navigation.navigate('PlaceDetails', { place });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={[styles.header, isSE && styles.headerSE]}>
          <Image source={require('../assets/loder.png')} style={[styles.logo, isSE && styles.logoSE]} resizeMode="contain" />
          <Text style={[styles.headerTitle, isSE && styles.headerTitleSE]}>Recommended places</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: isSE ? 16 : 28 }} showsVerticalScrollIndicator={false}>
    
        <View style={[styles.factCard, isSE && styles.factCardSE]}>
          <Text style={[styles.factTitle, isSE && styles.factTitleSE]}>Interesting fact</Text>
          <Text style={[styles.factText, isSE && styles.factTextSE]} numberOfLines={isSE ? 3 : undefined} ellipsizeMode="tail">
            {fact}
          </Text>
          <TouchableOpacity style={[styles.shareBtn, isSE && styles.shareBtnSE]} onPress={onShare} activeOpacity={0.9}>
            <Text style={[styles.shareText, isSE && styles.shareTextSE]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.chipsRowEven, isSE && styles.chipsRowEvenSE]}>
          {CATEGORIES.map((cat) => {
            const active = cat === activeCat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCat(cat)}
                activeOpacity={0.85}
                style={[styles.chipEven, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextOn, isSE && styles.chipTextSE]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={CARD_W + GAP} decelerationRate="fast"
                    contentContainerStyle={{ paddingRight: 8, gap: GAP }}>
          {DATA[activeCat].map((p, i) => (
            <PlaceCard key={`${p.title}-${i}`} place={p} width={CARD_W} onPress={() => openDetails(p)} isSE={isSE} />
          ))}
        </ScrollView>

        <View style={{ height: isSE ? 12 : 24 }} />
      </ScrollView>
    </View>
  );
}


function PlaceCard({
  place,
  width,
  onPress,
  isSE,
}: {
  place: Place;
  width: number;
  onPress: () => void;
  isSE: boolean;
}) {
  const base = Math.round((width * 9) / 16);
  const IMG_H = base + 120;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.placeCard, { width }]}>
      <ImageBackground source={place.image} style={[styles.image, { height: IMG_H }]} imageStyle={styles.imageRadius}>
        <View style={[styles.overlay, isSE && styles.overlaySE]}>
          <Text style={[styles.placeTitle, isSE && styles.placeTitleSE]} numberOfLines={1}>{place.title}</Text>
          <Text style={[styles.coords, isSE && styles.coordsSE]} numberOfLines={1}>{place.coords}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },

  headerSafe: { backgroundColor: PURPLE, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden' },
  header: { backgroundColor: PURPLE, paddingHorizontal: 16, paddingBottom: 14, paddingTop: Platform.select({ ios: 6, android: 12 }), flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerSE: { paddingBottom: 10, paddingTop: Platform.select({ ios: 4, android: 8 }) },
  logo: { width: 80, height: 65 },
  logoSE: { width: 72, height: 58 },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 20, fontWeight: '800', textAlign: 'center', marginRight: 92 },
  headerTitleSE: { fontSize: 18, marginRight: 80 },

  scroll: { flex: 1 },

  factCard: { backgroundColor: PURPLE, borderRadius: 18, padding: 14, marginBottom: 12 },
  factCardSE: { padding: 12, marginBottom: 10 },
  factTitle: { color: '#E9EDFF', fontWeight: '800', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  factTitleSE: { fontSize: 13, marginBottom: 6 },
  factText: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 18, textAlign: 'center', marginBottom: 10 },
  factTextSE: { fontSize: 12, lineHeight: 16, marginBottom: 8 },
  shareBtn: { alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  shareBtnSE: { paddingHorizontal: 16, paddingVertical: 8 },
  shareText: { color: '#1B1B1B', fontWeight: '800' },
  shareTextSE: { fontSize: 12, fontWeight: '700' },


  chipsRowEven: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  chipsRowEvenSE: { marginBottom: 10 },
  chipEven: {
    flexBasis: '31%',            
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2F3A6B',
  },
  chipActive: { backgroundColor: '#FFFFFF' },
  chipText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  chipTextSE: { fontSize: 11 },
  chipTextOn: { color: '#1B1B1B' },


  placeCard: { borderRadius: 18, overflow: 'hidden', backgroundColor: PURPLE },
  image: { width: '100%', justifyContent: 'flex-end', backgroundColor: '#000' },
  imageRadius: { borderRadius: 18 },

  overlay: { width: '100%', paddingTop: 8, paddingBottom: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.44)' },
  overlaySE: { paddingTop: 6, paddingBottom: 8, paddingHorizontal: 10 },
  placeTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  placeTitleSE: { fontSize: 14 },
  coords: { color: '#D5E2FF', fontSize: 12, marginTop: 2 },
  coordsSE: { fontSize: 11, marginTop: 2 },
});

export {};