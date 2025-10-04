
import React, { useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
  Image,
  SafeAreaView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import WebView from 'react-native-webview';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const SWITCH_MS = 6000;


const HTML_LOADER = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
  :root{
    --primary:#275EFE; --primary-dark:#1d46b6;
    --bg: transparent;
    --cycle: 4s;
    --cube:16px; --gap:6px;
    --bigGrid: calc(var(--cube)*3 + var(--gap)*2);
  }
  html,body{margin:0;padding:0;background:var(--bg);overflow:hidden}

  .stage{
    width:120px; height:160px;
    position:relative; margin:0 auto;
  }

  .grid, .big, .hole {
    position:absolute; left:50%; top:60px;          
    transform:translate(-50%,-50%);
  }

  .grid{
    width:var(--bigGrid); height:var(--bigGrid);
  }

  .cube{
    position:absolute; width:var(--cube); height:var(--cube);
    background:linear-gradient(145deg,var(--primary),var(--primary-dark));
    border-radius:4px;
    box-shadow:0 4px 10px rgba(0,0,0,.25);
    opacity:0; animation:assemble var(--cycle) ease-in-out;
    animation-iteration-count:1;
    transform:translate(0,0) scale(.8);
  }

  .c1{--to-x:0;--to-y:0}
  .c2{--to-x:calc(var(--cube)+var(--gap));--to-y:0}
  .c3{--to-x:calc(var(--cube)*2 + var(--gap)*2);--to-y:0}
  .c4{--to-x:0;--to-y:calc(var(--cube)+var(--gap))}
  .c5{--to-x:calc(var(--cube)+var(--gap));--to-y:calc(var(--cube)+var(--gap))}
  .c6{--to-x:calc(var(--cube)*2 + var(--gap)*2);--to-y:calc(var(--cube)+var(--gap))}
  .c7{--to-x:0;--to-y:calc(var(--cube)*2 + var(--gap)*2)}
  .c8{--to-x:calc(var(--cube)+var(--gap));--to-y:calc(var(--cube)*2 + var(--gap)*2)}
  .c9{--to-x:calc(var(--cube)*2 + var(--gap)*2);--to-y:calc(var(--cube)*2 + var(--gap)*2)}

  .c1{--from-x:-70px;--from-y:-48px;--d:.00s}
  .c2{--from-x: 68px;--from-y:-32px;--d:.05s}
  .c3{--from-x:-52px;--from-y: 60px;--d:.10s}
  .c4{--from-x: 74px;--from-y: 44px;--d:.15s}
  .c5{--from-x:-78px;--from-y: 12px;--d:.20s}
  .c6{--from-x: 36px;--from-y:-62px;--d:.25s}
  .c7{--from-x:-24px;--from-y: 72px;--d:.30s}
  .c8{--from-x: 82px;--from-y: 10px;--d:.35s}
  .c9{--from-x:-64px;--from-y:-70px;--d:.40s}
  .cube{animation-delay:var(--d)}

  @keyframes assemble{
    0%   {opacity:0; transform:translate(var(--from-x),var(--from-y)) scale(.6)}
    18%  {opacity:1}
    45%  {opacity:1; transform:translate(var(--to-x),var(--to-y)) scale(1)}
    62%  {opacity:0}
    100% {opacity:0; transform:translate(var(--to-x),var(--to-y)) scale(1)}
  }

  .big{
    width:80px; height:80px;
    background:linear-gradient(145deg,var(--primary),var(--primary-dark));
    box-shadow:0 10px 20px rgba(0,0,0,.35);
    opacity:0; animation:biglife var(--cycle) ease-in-out;
    animation-iteration-count:1;
  }
  @keyframes biglife{
    0%,54% {opacity:0; transform:translate(-50%,-50%) translateY(0) scale(.9)}
    60%,72%{opacity:1; transform:translate(-50%,-50%) translateY(0) scale(1)}
    80%    {opacity:1; transform:translate(-50%,-50%) translateY(18px) scale(1)}
    88%    {opacity:.95; transform:translate(-50%,-50%) translateY(56px) scale(.99)}
    100%   {opacity:0; transform:translate(-50%,-50%) translateY(120px) scale(.96)}
  }

  .hole{
    width:90px; height:24px;
    transform:translate(-50%,-50%) translateY(70px) scaleX(0);
    background:radial-gradient(ellipse at center, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 70%);
    filter:blur(2px);
    opacity:0; animation:hole var(--cycle) ease-in-out;
    animation-iteration-count:1;
  }
  @keyframes hole{
    0%,70% {transform:translate(-50%,-50%) translateY(70px) scaleX(0); opacity:0}
    76%    {transform:translate(-50%,-50%) translateY(70px) scaleX(.6); opacity:1}
    86%    {transform:translate(-50%,-50%) translateY(70px) scaleX(1); opacity:1}
    100%   {transform:translate(-50%,-50%) translateY(70px) scaleX(1.1); opacity:0}
  }
</style>
</head>
<body>
  <div class="stage">
    <div class="grid">
      <div class="cube c1"></div><div class="cube c2"></div><div class="cube c3"></div>
      <div class="cube c4"></div><div class="cube c5"></div><div class="cube c6"></div>
      <div class="cube c7"></div><div class="cube c8"></div><div class="cube c9"></div>
    </div>
    <div class="big"></div>
    <div class="hole"></div>
  </div>
</body>
</html>`;

export default function LoaderScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const isSmallH = height < 720;

  const imgOpacity = useRef(new Animated.Value(0)).current;
  const imgTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(imgOpacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(imgTranslate, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [imgOpacity, imgTranslate]);

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), SWITCH_MS);
    return () => clearTimeout(t);
  }, [navigation]);

  const bottomOffset = isSmallH ? 34 : 56;

  return (
    <ImageBackground
      source={require('../assets/background_lod.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>

        <Animated.Image
          source={require('../assets/loder.png')}
          style={{
            width: 300,
            height: 250,
            alignSelf: 'center',
            marginTop: 20,
            opacity: imgOpacity,
            transform: [{ translateY: imgTranslate }],
          }}
          resizeMode="contain"
        />

        <View
          pointerEvents="none"
          style={[
            styles.webOverlay,
            {
              width: 120,
              height: 120,
              left: (width - 120) / 2,
              bottom: bottomOffset,
            },
          ]}
        >
          <View style={styles.whiteFrame}>
         
            <WebView
              originWhitelist={['*']}
              source={{ html: HTML_LOADER, baseUrl: '' }}
              style={{ width: 120, height: 160, backgroundColor: 'transparent' }}
              containerStyle={{ backgroundColor: 'transparent' }}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              automaticallyAdjustContentInsets={false}
              {...(Platform.OS === 'android' ? { androidLayerType: 'hardware' as const } : {})}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  webOverlay: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteFrame: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,     
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'visible',  
  },
});
