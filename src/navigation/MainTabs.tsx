
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Image,
  Platform,
  View,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import RecommendedPlacesScreen from '../screens/RecommendedPlacesScreen';
import SavedPlacesScreen from '../screens/SavedPlacesScreen';
import InteractiveMapScreen from '../screens/InteractiveMapScreen';
import AboutAppScreen from '../screens/AboutAppScreen';

export type TabsParamList = {
  Recommended: undefined;
  Saved: undefined;
  Map: undefined;
  About: undefined;
};

const Tab = createBottomTabNavigator<TabsParamList>();

function TabIcon({
  focused,
  activeSrc,
  inactiveSrc,
}: {
  focused: boolean;
  activeSrc: any;
  inactiveSrc: any;
}) {
  return (
    <Image
      source={focused ? activeSrc : inactiveSrc}
      style={{
        width: focused ? 99 : 25,
        height: focused ? 40 : 25,
      }}
      resizeMode="contain"
    />
  );
}

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();

  const isSmall = width <= 375 || height <= 667;

  const INNER_H = Platform.select({
    ios: isSmall ? 64 : 74,
    android: isSmall ? 60 : 68,
  }) as number;

  const OUTER_H = INNER_H + insets.bottom;
  const V_PAD = insets.bottom / 2; 

  return (
    <View style={[styles.bar, { height: OUTER_H, paddingTop: V_PAD, paddingBottom: V_PAD }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const iconSet: Record<string, { active: any; inactive: any }> = {
          Recommended: {
            active: require('../assets/ic_home_active.png'),
            inactive: require('../assets/ic_home.png'),
          },
          Saved: {
            active: require('../assets/ic_saved_active.png'),
            inactive: require('../assets/ic_saved.png'),
          },
          Map: {
            active: require('../assets/ic_map_active.png'),
            inactive: require('../assets/ic_map.png'),
          },
          About: {
            active: require('../assets/ic_info_active.png'),
            inactive: require('../assets/ic_info.png'),
          },
        };
        const srcs = iconSet[route.name] ?? iconSet.Recommended;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
           
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.item, { height: INNER_H }]}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrap}>
              <TabIcon focused={isFocused} activeSrc={srcs.active} inactiveSrc={srcs.inactive} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Recommended"
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Recommended" component={RecommendedPlacesScreen} />
      <Tab.Screen name="Saved" component={SavedPlacesScreen} />
      <Tab.Screen name="Map" component={InteractiveMapScreen} />
      <Tab.Screen name="About" component={AboutAppScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#4D5B94',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
