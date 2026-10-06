import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { azkarSabah, azkarMasaa } from '../data/azkar';

export default function AzkarCategoriesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071220" />
      
      <LinearGradient
        colors={['#071220', '#0a1628', '#071a0b']}
        style={StyleSheet.absoluteFillObject}
      />

      <LinearGradient
        colors={['#1a2f4e', '#0d1f3c']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>أذكار الصباح والمساء</Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.cardWrapper}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AzkarList', {
            title: '☀️ أذكار الصباح',
            data: azkarSabah,
            color: '#1d3557'
          })}
        >
          <LinearGradient
            colors={['#1d3557', '#11223a']}
            style={[styles.card, { borderBottomColor: '#c9a84c', borderBottomWidth: 4 }]}
          >
            <MaterialCommunityIcons name="weather-sunny" size={48} color="#c9a84c" />
            <Text style={styles.cardTitle}>أذكار الصباح</Text>
            <Text style={styles.cardSub}>تقرأ من بعد صلاة الفجر حتى طلوع الشمس</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardWrapper}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AzkarList', {
            title: '🌙 أذكار المساء',
            data: azkarMasaa,
            color: '#6d2e6e'
          })}
        >
          <LinearGradient
            colors={['#2a1635', '#1a0d22']}
            style={[styles.card, { borderBottomColor: '#a0aec0', borderBottomWidth: 4 }]}
          >
            <MaterialCommunityIcons name="weather-night" size={48} color="#a0aec0" />
            <Text style={styles.cardTitle}>أذكار المساء</Text>
            <Text style={styles.cardSub}>تقرأ من بعد صلاة العصر حتى غروب الشمس</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 4, paddingRight: 10 },
  backText: { color: '#c9a84c', fontSize: 16, fontFamily: 'CairoBold' },
  headerTitle: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 20,
    fontFamily: 'CairoBold',
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#ffffff11',
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 24,
    fontFamily: 'CairoBold',
    marginTop: 15,
    marginBottom: 5,
  },
  cardSub: {
    color: '#a0aec0',
    fontSize: 14,
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
});
