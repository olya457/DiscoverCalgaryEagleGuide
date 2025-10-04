import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const { width, height } = useWindowDimensions();

  const isSE = height <= 667 || width <= 375;
  const isSmall = isSE || height < 700;

  const IMG_ASPECT = 480 / 370;
  const CARD_MAX = 342;
  const CARD_MIN = 300;

  const EXTRA_SHIFT = 10;
  const OVERLAP = 10;
  const BASE_DROP = 20 + EXTRA_SHIFT;
  const EXTRA_IMAGE_DROP = 30;
  const DROP_TOTAL = BASE_DROP + EXTRA_IMAGE_DROP;

  const CARD_BASE = Math.min(CARD_MAX, Math.max(CARD_MIN, Math.round(height * 0.40)));
  const CARD_HEIGHT = Math.max(230, CARD_BASE - (isSmall ? 24 : 0));
  const AVAILABLE_IMG_H = Math.max(200, height - CARD_HEIGHT + OVERLAP - 12);

  const imgWidthOther = width * 0.96; 
  const baseImgHOther = Math.round(imgWidthOther * IMG_ASPECT);
  const imgHeightOther = Math.min(
    Math.max(0, baseImgHOther),
    Math.round(AVAILABLE_IMG_H - DROP_TOTAL)
  );

  const leftShift = Math.ceil((width - imgWidthOther) / 2); 
  const isStep1 = step === 1;

  const imgOpacity = useRef(new Animated.Value(0)).current;
  const imgTranslate = useRef(new Animated.Value(26)).current;
  const imgScale = useRef(new Animated.Value(0.98)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(28)).current;

  const runEnter = () => {
    imgOpacity.setValue(0); imgTranslate.setValue(26); imgScale.setValue(0.98);
    cardOpacity.setValue(0); cardTranslate.setValue(28);
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(imgOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(imgTranslate, { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(imgScale, { toValue: 1, duration: 420, easing: Easing.back(1.2), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  };

  useEffect(runEnter, []);
  useEffect(runEnter, [step]);

  const data = useMemo(
    () => [
      {
        bg: require('../assets/onboarding1_bg.png'),
        picture: require('../assets/picture1.png'),
        title: "Hi, I’m your Calgary Guide.",
        subtitle:
          "I’ll show you the best of our city — from nature escapes to cultural gems and fun activities.",
        cta: 'Go',
      },
      {
        bg: require('../assets/onboarding1_bg.png'),
        picture: require('../assets/picture2.png'),
        title: "I’ll recommend top places in three categories:",
        subtitle:
          "Nature, Culture, and Entertainment. Save your favorite spots and create your personal list for an unforgettable trip!",
        cta: 'Next',
      },
      {
        bg: require('../assets/onboarding1_bg.png'),
        picture: require('../assets/picture3.png'),
        title: "With our interactive map, you’ll always know where to go next.",
        subtitle:
          "Let’s start your journey and dive into the spirit of Calgary together!",
        cta: 'Start',
      },
    ],
    []
  );

  const goNext = () => {
    if (step < 2) setStep((s) => ((s + 1) as 0 | 1 | 2));
    else navigation.replace('Tabs');
  };

  const { bg, picture, title, subtitle, cta } = data[step];

  const dynamic = StyleSheet.create({
    pictureWrap: {
      width: '100%',
      paddingBottom: Math.max(0, CARD_HEIGHT - OVERLAP - BASE_DROP), 
      alignItems: isStep1 ? 'center' : 'center', 
    },
    picture: isStep1
      ? {
          width: imgWidthOther,
          height: imgHeightOther,
          marginTop: DROP_TOTAL,
          alignSelf: 'center',
          transform: [{ translateX: -leftShift - 0.5 }], 
        }
      : {
          width: imgWidthOther,
          height: imgHeightOther,
          marginTop: DROP_TOTAL,
          alignSelf: 'center',
        },
    card: {
      width: Math.min(393, width),
      height: CARD_HEIGHT,
      transform: [{ translateY: EXTRA_SHIFT }],
    },
    button: {
      width: Math.min(325, width - 48),
      height: isSmall ? 58 : 65,
    },
    subtitle: {
      fontSize: isSmall ? 13 : 14,
      lineHeight: isSmall ? 18 : 20,
      paddingHorizontal: isSmall ? 4 : 8,
    },
    title: { fontSize: isSmall ? 17 : 18 },
  });

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <Animated.View
        style={[
          dynamic.pictureWrap,
          { opacity: imgOpacity, transform: [{ translateY: imgTranslate }, { scale: imgScale }] },
        ]}
      >
        <Image
          source={picture}
          style={dynamic.picture}
          resizeMode="contain" 
        />
      </Animated.View>

      <SafeAreaView style={styles.safeBottom}>
        <View style={styles.cardWrap} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.cardBase,
              dynamic.card,
              { opacity: cardOpacity, transform: [{ translateY: cardTranslate }, ...dynamic.card.transform!] },
            ]}
          >
            <Text style={[styles.title, dynamic.title]}>{title}</Text>

            <Text
              style={[styles.subtitle, dynamic.subtitle]}
              numberOfLines={isSmall ? 4 : undefined}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>

            <TouchableOpacity
              style={[styles.buttonBase, dynamic.button]}
              onPress={goNext}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>{cta}</Text>
            </TouchableOpacity>

            <View style={styles.dots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safeBottom: {},
  cardWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    paddingBottom: Platform.select({ ios: 8, android: 12 }),
  },
  cardBase: {
    backgroundColor: '#4D5B94',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  buttonBase: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: 6,
  },
  buttonText: {
    color: '#1B1B1B',
    fontSize: 18,
    fontWeight: '800',
  },
  dots: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    flexDirection: 'row',
  },
  dot: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#FFFFFF' },
});
