import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, ImageBackground, Dimensions, StatusBar, TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreenCustom({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const timerRef = useRef(null);
  const isNavigating = useRef(false);

  const navigateToHome = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Home');
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      })
    ]).start();

    timerRef.current = setTimeout(() => {
      navigateToHome();
    }, 1800); // انتقال تلقائي سريع ومريح بعد ثانية وثمانية أعشار بدلاً من أربع ثوانٍ

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={navigateToHome}
      style={{ flex: 1 }}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" backgroundColor="#071a0b" hidden={true} />
        <ImageBackground
          source={require('../assets/splash.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <Animated.View style={[styles.overlay, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.textContainer}>
              <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
              
              <View style={styles.separatorTop} />
              
              <Text style={styles.mainText}>صَدَقَةٌ جَارِيَةٌ</Text>
              
              <Text style={styles.subText}>
                عَنْ رُوحِ الشَّهِيدِ بِإِذْنِ اللَّهِ
              </Text>
              
              <Text style={styles.nameText}>
                أَمِير مُحَمَّد نُوفَل
              </Text>
              
              <Text style={styles.subText}>
                وَأَمْوَاتِ الْمُسْلِمِينَ
              </Text>
              
              <View style={styles.separatorBottom} />

              <Text style={styles.skipHint}>اضغط في أي مكان للمتابعة سريعاً</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071a0b',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(7, 26, 11, 0.75)',
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#c9a84c',
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  bismillah: {
    fontFamily: 'Amiri',
    fontSize: 24,
    color: '#c9a84c',
    marginBottom: 20,
  },
  separatorTop: {
    width: '40%',
    height: 1.5,
    backgroundColor: '#c9a84c',
    marginBottom: 20,
    opacity: 0.5,
  },
  separatorBottom: {
    width: '40%',
    height: 1.5,
    backgroundColor: '#c9a84c',
    marginTop: 20,
    opacity: 0.5,
  },
  mainText: {
    fontFamily: 'AmiriBold',
    fontSize: 34,
    color: '#f6e05e',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  subText: {
    fontFamily: 'Cairo',
    fontSize: 17,
    color: '#e2e8f0',
    marginVertical: 8,
    textAlign: 'center',
    lineHeight: 28,
  },
  nameText: {
    fontFamily: 'AmiriBold',
    fontSize: 32,
    color: '#c9a84c',
    marginVertical: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 5,
  },
  skipHint: {
    fontFamily: 'Cairo',
    fontSize: 12,
    color: '#c9a84caa',
    marginTop: 18,
    textAlign: 'center',
  }
});
