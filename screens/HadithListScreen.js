import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HadithListScreen({ route, navigation }) {
  const { category } = route.params;

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
        style={[styles.header, { borderBottomColor: category.color }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category.icon} {category.title}
        </Text>
      </LinearGradient>

      <FlatList
        data={category.ahadith}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#1a2f4e', '#11223a']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                {/* Number */}
                <View style={[styles.numberBadge, { backgroundColor: category.color + '22', borderColor: category.color + '66' }]}>
                  <Text style={[styles.numberText, { color: category.color }]}>{index + 1}</Text>
                </View>
                <FontAwesome5 name="quote-left" size={20} color={category.color + '44'} />
              </View>

              {/* Hadith Text */}
              <Text style={styles.hadithText}>{item.text}</Text>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: category.color + '44' }]} />

              {/* Narrator & Source */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <FontAwesome5 name="user-check" size={14} color="#a0aec0" />
                  <Text style={styles.narrator}>{item.narrator}</Text>
                </View>
                <View style={styles.metaItem}>
                  <FontAwesome5 name="book-open" size={14} color={category.color} />
                  <Text style={[styles.source, { color: category.color }]}>{item.source}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
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
    borderBottomWidth: 3,
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
  list: { padding: 16, paddingBottom: 40 },
  cardWrapper: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c9a84c22',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontFamily: 'CairoBold',
  },
  hadithText: {
    color: '#e8dcc8',
    fontSize: 22,
    lineHeight: 44,
    textAlign: 'right',
    fontFamily: 'Amiri',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  narrator: {
    color: '#a0aec0',
    fontSize: 13,
    fontFamily: 'Cairo',
  },
  source: {
    fontSize: 13,
    fontFamily: 'CairoBold',
  },
});
