import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, StatusBar, Dimensions, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ZIKR_LIST = [
  'سُبْحَانَ اللَّهِ',
  'الْحَمْدُ لِلَّهِ',
  'لَا إِلَٰهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ'
];

export default function SubhaScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [zikrIndex, setZikrIndex] = useState(0);

  useEffect(() => {
    loadTotal();
  }, []);

  const loadTotal = async () => {
    try {
      const savedTotal = await AsyncStorage.getItem('subha_total');
      if (savedTotal !== null) {
        setTotalCount(parseInt(savedTotal));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTap = async () => {
    Vibration.vibrate(40); // Haptic feedback
    const newCount = count + 1;
    const newTotal = totalCount + 1;
    
    setCount(newCount);
    setTotalCount(newTotal);

    try {
      await AsyncStorage.setItem('subha_total', newTotal.toString());
    } catch (e) {}
  };

  const resetCount = () => {
    setCount(0);
  };

  const changeZikr = () => {
    setZikrIndex((prev) => (prev + 1) % ZIKR_LIST.length);
    setCount(0);
  };

  const confirmResetTotal = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("هل أنت متأكد أنك تريد تصفير مجموع التسبيحات الكلي؟");
      if (confirmed) {
        setTotalCount(0);
        AsyncStorage.setItem('subha_total', '0');
      }
    } else {
      Alert.alert(
        "تصفير العداد الكلي",
        "هل أنت متأكد أنك تريد تصفير مجموع التسبيحات الكلي طوال فترة استخدامك؟",
        [
          { text: "إلغاء", style: "cancel" },
          { 
            text: "نعم، صَفِّر", 
            onPress: () => {
              setTotalCount(0);
              AsyncStorage.setItem('subha_total', '0');
            }, 
            style: "destructive" 
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071a0b" />
      <LinearGradient colors={['#071220', '#0a1628', '#071a0b']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-right" size={28} color="#c9a84c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>السبحة الإلكترونية</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Zikr Text */}
        <TouchableOpacity onPress={changeZikr} style={styles.zikrContainer}>
          <Text style={styles.zikrText}>{ZIKR_LIST[zikrIndex]}</Text>
          <Text style={styles.zikrHint}>اضغط هنا لتغيير الذكر</Text>
        </TouchableOpacity>

        {/* Total Count */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>مجموع التسبيحات الكلي</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 5 }}>
            <Text style={[styles.totalNumber, { marginTop: 0 }]}>{totalCount}</Text>
            <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={confirmResetTotal} style={{ padding: 8, backgroundColor: '#c9a84c15', borderRadius: 20, borderWidth: 1, borderColor: '#c9a84c33', marginLeft: 10 }}>
              <MaterialCommunityIcons name="history" size={20} color="#c9a84c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tap Circle */}
        <TouchableOpacity activeOpacity={0.7} onPress={handleTap} style={styles.tapCircleWrapper}>
          <LinearGradient colors={['#c9a84c', '#7b5c1c']} style={styles.tapCircleOuter} start={{x:0, y:0}} end={{x:1, y:1}}>
            <LinearGradient colors={['#0a1628', '#071220']} style={styles.tapCircleInner}>
              <Text style={styles.tapNumber}>{count}</Text>
              <Text style={styles.tapHint}>اضغط هنا</Text>
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity onPress={resetCount} style={styles.resetBtn}>
          <MaterialCommunityIcons name="refresh" size={20} color="#c9a84c" />
          <Text style={styles.resetText}>تصفير العداد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#071a0b', borderBottomWidth: 1, borderBottomColor: '#c9a84c44',
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#c9a84c', fontSize: 20, fontFamily: 'CairoBold' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  zikrContainer: {
    backgroundColor: 'transparent', padding: 25, borderRadius: 25,
    borderWidth: 1, borderColor: '#c9a84c33', width: '100%', alignItems: 'center',
    marginBottom: 40, borderStyle: 'dashed',
  },
  zikrText: { color: '#c9a84c', fontSize: 28, fontFamily: 'Amiri', textAlign: 'center', lineHeight: 45 },
  zikrHint: { color: '#cbd5e0', fontSize: 12, fontFamily: 'Cairo', marginTop: 10, opacity: 0.7 },
  totalContainer: { alignItems: 'center', marginBottom: 40 },
  totalLabel: { color: '#cbd5e0', fontSize: 16, fontFamily: 'Cairo' },
  totalNumber: { color: '#c9a84c', fontSize: 24, fontFamily: 'CairoBold', marginTop: 5 },
  tapCircleWrapper: {
    width: width * 0.55, height: width * 0.55, borderRadius: width,
    shadowColor: '#c9a84c', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 20, marginBottom: 40,
  },
  tapCircleOuter: {
    flex: 1, borderRadius: width, alignItems: 'center', justifyContent: 'center',
    padding: 6,
  },
  tapCircleInner: {
    flex: 1, width: '100%', borderRadius: width, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#c9a84c44',
  },
  tapNumber: { color: '#c9a84c', fontSize: 60, fontFamily: 'CairoBold', textShadowColor: '#c9a84c44', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10 },
  tapHint: { color: '#cbd5e0', fontSize: 14, fontFamily: 'Cairo', marginTop: -10, opacity: 0.7 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#c9a84c11', borderWidth: 1, borderColor: '#c9a84c44', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 30 },
  resetText: { color: '#c9a84c', fontSize: 15, fontFamily: 'Cairo', marginLeft: 8 },
});
