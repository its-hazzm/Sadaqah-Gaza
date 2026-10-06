import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, StatusBar, TextInput,
} from 'react-native';
import { surahs } from '../data/surahs';

// الصفحة الأولى لكل سورة في المصحف
const surahStartPages = [
  1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,322,332,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,477,483,489,495,499,503,507,511,515,518,520,523,526,528,531,534,537,539,542,544,546,548,550,552,554,556,558,560,562,564,566,568,570,572,574,576,578,580,582,583,585,586,587,589,591,592,593,594,595,596,597,598,599,600,601,601,602,602,603,603,603,604,604,604,604,604,604,604,604,604,604,604,604,604,
];

export default function QuranScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filtered = surahs.filter(s =>
    s.name.includes(search) || String(s.number).includes(search)
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071a0b" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>→ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📖 القرآن الكريم</Text>
      </View>

      {/* أزرار الأعلى */}
      <View style={styles.topBtns}>
        <TouchableOpacity
          style={[styles.topBtn, { flex: 1.2 }]}
          onPress={() => navigation.navigate('Mushaf', { page: 1 })}
        >
          <Text style={styles.topBtnText}>📖 ابدأ القراءة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topBtn, styles.searchTopBtn, { flex: 1 }]}
          onPress={() => navigation.navigate('QuranSearch')}
        >
          <Text style={styles.topBtnText}>🔍 بحث في الآيات</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن سورة بالاسم أو الرقم..."
          placeholderTextColor="#4a5568"
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {/* Surahs List */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.number)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.surahCard}
            onPress={() => navigation.navigate('Mushaf', {
              page: surahStartPages[item.number - 1] || 1,
            })}
            activeOpacity={0.8}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{item.number}</Text>
            </View>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{item.name}</Text>
              <Text style={styles.surahMeta}>
                {item.revelationType} • {item.versesCount} آية • ص {surahStartPages[item.number - 1]}
              </Text>
            </View>
            <Text style={styles.arrow}>←</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    backgroundColor: '#071a0b',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginLeft: 10 },
  backText: { color: '#c9a84c', fontSize: 15 },
  headerTitle: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  topBtns: {
    flexDirection: 'row',
    gap: 10,
    margin: 12,
  },
  topBtn: {
    backgroundColor: '#1a3a1a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9a84c55',
  },
  searchTopBtn: {
    backgroundColor: '#1a2f4e',
    borderColor: '#4a80c455',
  },
  topBtnText: { color: '#c9a84c', fontSize: 14, fontWeight: 'bold' },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#1a2f4e',
    color: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  list: { paddingHorizontal: 12, paddingBottom: 30 },
  surahCard: {
    backgroundColor: '#1a2f4e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c9a84c22',
    borderWidth: 1,
    borderColor: '#c9a84c55',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  numberText: { color: '#c9a84c', fontSize: 13, fontWeight: 'bold' },
  surahInfo: { flex: 1, alignItems: 'flex-end' },
  surahName: { color: '#e2e8f0', fontSize: 17, fontWeight: 'bold', fontFamily: 'serif' },
  surahMeta: { color: '#718096', fontSize: 11, marginTop: 2 },
  arrow: { color: '#c9a84c', fontSize: 18, marginRight: 4 },
});
