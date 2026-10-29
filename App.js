import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';

import HomeScreen from './screens/HomeScreen';
import ZikrScreen from './screens/ZikrScreen';
import QuranScreen from './screens/QuranScreen';
import MushafScreen from './screens/MushafScreen';
import QuranSearchScreen from './screens/QuranSearchScreen';
import HadithCategoriesScreen from './screens/HadithCategoriesScreen';
import HadithListScreen from './screens/HadithListScreen';
import AzkarCategoriesScreen from './screens/AzkarCategoriesScreen';
import SplashScreenCustom from './screens/SplashScreenCustom';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import SubhaScreen from './screens/SubhaScreen';
import {
  duaaMotawafa, adiya,
} from './data/azkar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadFonts() {
      try {
        const fontPromise = Font.loadAsync({
          Amiri: Amiri_400Regular,
          AmiriBold: Amiri_700Bold,
          Cairo: Cairo_400Regular,
          CairoBold: Cairo_700Bold,
        });
        // الحد الأقصى للانتظار ثانية ونصف لضمان عدم تعليق التطبيق نهائياً
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
        await Promise.race([fontPromise, timeoutPromise]);
      } catch (e) {
        console.warn('Font loading notice:', e);
      } finally {
        if (isMounted) {
          setFontsLoaded(true);
        }
      }
    }
    loadFonts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a1628', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#c9a84c" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreenCustom} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />

        <Stack.Screen
          name="DuaaMotawafa"
          component={ZikrScreen}
          initialParams={{
            title: '🤲 دعاء للمتوفى',
            data: duaaMotawafa,
            color: '#2d6a4f',
            isDuaa: true,
          }}
        />

        <Stack.Screen name="AzkarCategories" component={AzkarCategoriesScreen} />
        <Stack.Screen name="AzkarList" component={ZikrScreen} />

        <Stack.Screen
          name="Adiya"
          component={ZikrScreen}
          initialParams={{
            title: '📿 أدعية مأثورة',
            data: adiya,
            color: '#7b4f12',
            isDuaa: true,
          }}
        />

        {/* القرآن الكريم */}
        <Stack.Screen name="Quran" component={QuranScreen} />
        <Stack.Screen name="Mushaf" component={MushafScreen} />
        <Stack.Screen name="QuranSearch" component={QuranSearchScreen} />

        {/* الأحاديث الشريفة - مصنفة بالمواضيع */}
        <Stack.Screen name="Ahadith" component={HadithCategoriesScreen} />
        <Stack.Screen name="HadithList" component={HadithListScreen} />
        <Stack.Screen name="Subha" component={SubhaScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
