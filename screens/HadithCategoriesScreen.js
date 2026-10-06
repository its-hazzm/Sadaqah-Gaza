import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hadithCategories } from '../data/ahadithCategories';

export default function HadithCategoriesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071220" />
      
      {/* Background */}
      <LinearGradient
        colors={['#071220', '#0a1628', '#071a0b']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <LinearGradient
        colors={['#1a2f4e', '#0d1f3c']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الأحاديث الشريفة</Text>
      </LinearGradient>

      <Text style={styles.subtitle}>اختر الموضوع الذي تريد قراءته</Text>

      <FlatList
        data={hadithCategories}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('HadithList', { category: item })}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1a2f4e', '#11223a']}
              style={[styles.card, { borderBottomColor: item.color, borderBottomWidth: 4 }]}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: item.color + '22' }]}>
                <Text style={[styles.cardCount, { color: item.color }]}>
                  {item.ahadith.length} أحاديث
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
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
  subtitle: {
    color: '#a0aec0',
    fontSize: 15,
    fontFamily: 'Cairo',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  list: { padding: 14, paddingBottom: 40 },
  cardWrapper: {
    flex: 1,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 34,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontFamily: 'CairoBold',
    marginBottom: 10,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCount: {
    fontSize: 12,
    fontFamily: 'CairoBold',
  },
});
