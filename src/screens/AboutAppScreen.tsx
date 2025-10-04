import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform,
  Share,
  useWindowDimensions,
  Animated,
  ScrollView,
} from 'react-native';

const COLOR_PURPLE = '#4D5B94';
const COLOR_DARK_BACKGROUND = '#0E0E0E';

export default function AboutAppScreen() {
  const windowInfo = useWindowDimensions();
  const isSmallScreen = windowInfo.width <= 375 || windowInfo.height <= 667;

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slideAnimation, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fadeAnimation, slideAnimation]);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Discover Calgary Eagle Guide — your personal city guide. Explore by category, save favorites, and use the interactive map. (App link here)',
      });
    } catch {}
  };

  const heroHeight = isSmallScreen ? 240 : 320;
  const verticalSpaceAfterHeader = 20;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={[styles.headerContainer, isSmallScreen && styles.headerContainerSmall]}>
          <Image source={require('../assets/loder1.png')} style={[styles.headerLogo, isSmallScreen && styles.headerLogoSmall]} resizeMode="contain" />
          <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleSmall]}>About for app</Text>
        </View>
      </SafeAreaView>

      <Animated.View style={{ flex: 1, opacity: fadeAnimation, transform: [{ translateY: slideAnimation }] }}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { marginTop: verticalSpaceAfterHeader },
            isSmallScreen && styles.contentContainerSmall,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroWrapper, { height: heroHeight }]}>
            <Image
              source={require('../assets/loder1.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.descriptionText, isSmallScreen && styles.descriptionTextSmall]}>
            Discover Calgary Eagle Guide is your personal guide to Calgary. The app will help you discover the best places in the city by category, save your favorite locations, and use the interactive map for convenient travel.
          </Text>

          <TouchableOpacity style={[styles.shareButton, isSmallScreen && styles.shareButtonSmall]} activeOpacity={0.9} onPress={handleShare}>
            <Text style={[styles.shareButtonText, isSmallScreen && styles.shareButtonTextSmall]}>Share</Text>
          </TouchableOpacity>

          <View style={{ height: isSmallScreen ? 16 : 24 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLOR_DARK_BACKGROUND },
  headerSafe: {
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
  headerLogoSmall: { width: 70, height: 56 },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginRight: 92,
  },
  headerTitleSmall: { fontSize: 18, marginRight: 80 },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  contentContainerSmall: { paddingBottom: 20 },
  heroWrapper: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  descriptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 22,
  },
  descriptionTextSmall: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  shareButton: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  shareButtonSmall: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  shareButtonText: { color: '#1B1B1B', fontWeight: '800', fontSize: 16 },
  shareButtonTextSmall: { fontSize: 15 },
});
