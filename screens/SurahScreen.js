import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { surahs } from '../data/surahs';

export default function SurahScreen({ route, navigation }) {
  const { surah } = route.params;
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(surah.number - 1);
  const scrollRef = useRef(null);

  const currentSurah = surahs[currentSurahIndex];

  useEffect(() => {
    fetchSurah(currentSurah.number);
  }, [currentSurahIndex]);

  const fetchSurah = async (number) => {
    try {
      setLoading(true);
      setError(false);
      setVerses([]);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`
      );
      const data = await response.json();
      if (data.code === 200) {
        setVerses(data.data.ayahs);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (currentSurahIndex < 113) setCurrentSurahIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (currentSurahIndex > 0) setCurrentSurahIndex(prev => prev - 1);
  };

  // بناء النص المتصل للسورة
  const buildContinuousText = () => {
    if (!verses.length) return null;
    return verses.map((v) => (
      <Text key={v.number} style={styles.inlineVerse}>
        {v.text}
        {'  '}
        <Text style={styles.verseNum}>﴿{v.numberInSurah}﴾</Text>
        {'  '}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>→</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>سورة {currentSurah.name}</Text>
          <Text style={styles.headerMeta}>
            {currentSurah.revelationType} • {currentSurah.versesCount} آية • الجزء {getJuz(currentSurah.number)}
          </Text>
        </View>

        <View style={styles.headerNum}>
          <Text style={styles.surahNumText}>{currentSurah.number}</Text>
        </View>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={goPrev}
          disabled={currentSurahIndex === 0}
          style={[styles.navBtn, currentSurahIndex === 0 && styles.navBtnDisabled]}
        >
          <Text style={styles.navBtnText}>
            ← {currentSurahIndex > 0 ? surahs[currentSurahIndex - 1].name : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goNext}
          disabled={currentSurahIndex === 113}
          style={[styles.navBtn, currentSurahIndex === 113 && styles.navBtnDisabled]}
        >
          <Text style={styles.navBtnText}>
            {currentSurahIndex < 113 ? surahs[currentSurahIndex + 1].name : ''} →
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* البسملة */}
        {currentSurah.number !== 9 && (
          <View style={styles.bismillahBox}>
            <Text style={styles.bismillah}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
        )}

        {/* المحتوى */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#c9a84c" />
            <Text style={styles.loadingText}>جارٍ تحميل سورة {currentSurah.name}...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>تعذّر التحميل ⚠️</Text>
            <Text style={styles.errorSub}>تحقق من اتصال الإنترنت</Text>
            <TouchableOpacity onPress={() => fetchSurah(currentSurah.number)} style={styles.retryBtn}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.textContainer}>
            <Text style={styles.continuousText}>
              {buildContinuousText()}
            </Text>
          </View>
        )}

        {/* زر السورة التالية في الأسفل */}
        {!loading && !error && currentSurahIndex < 113 && (
          <TouchableOpacity style={styles.nextSurahBtn} onPress={goNext}>
            <Text style={styles.nextSurahText}>
              التالي: سورة {surahs[currentSurahIndex + 1].name} ←
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// تحديد الجزء بشكل تقريبي
function getJuz(surahNum) {
  if (surahNum <= 2) return surahNum === 1 ? 1 : 1;
  if (surahNum <= 4) return 3;
  if (surahNum <= 5) return 6;
  if (surahNum <= 7) return 7;
  if (surahNum <= 9) return 10;
  if (surahNum <= 11) return 11;
  if (surahNum <= 15) return 14;
  if (surahNum <= 18) return 15;
  if (surahNum <= 20) return 16;
  if (surahNum <= 23) return 18;
  if (surahNum <= 25) return 19;
  if (surahNum <= 27) return 20;
  if (surahNum <= 29) return 21;
  if (surahNum <= 33) return 22;
  if (surahNum <= 36) return 23;
  if (surahNum <= 39) return 24;
  if (surahNum <= 41) return 25;
  if (surahNum <= 45) return 26;
  if (surahNum <= 49) return 27;
  if (surahNum <= 56) return 28;
  if (surahNum <= 66) return 29;
  return 30;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1923' },
  header: {
    backgroundColor: '#0d1f3c',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#c9a84c',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 6 },
  backText: { color: '#c9a84c', fontSize: 20 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  headerMeta: { color: '#718096', fontSize: 11, marginTop: 2 },
  headerNum: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#c9a84c22',
    borderWidth: 1,
    borderColor: '#c9a84c55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumText: { color: '#c9a84c', fontSize: 12, fontWeight: 'bold' },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0d1f3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1a2f4e',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#c9a84c', fontSize: 12 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20 },

  bismillahBox: {
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c33',
  },
  bismillah: {
    color: '#c9a84c',
    fontSize: 22,
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 38,
  },

  textContainer: {
    backgroundColor: '#1a2f4e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c9a84c22',
  },
  continuousText: {
    textAlign: 'justify',
    writingDirection: 'rtl',
  },
  inlineVerse: {
    color: '#e8dcc8',
    fontSize: 22,
    lineHeight: 46,
    fontFamily: 'serif',
    textAlign: 'right',
  },
  verseNum: {
    color: '#c9a84c',
    fontSize: 16,
    fontFamily: 'serif',
  },

  nextSurahBtn: {
    marginTop: 20,
    backgroundColor: '#1a2f4e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9a84c44',
  },
  nextSurahText: { color: '#c9a84c', fontSize: 15, fontWeight: 'bold' },

  center: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: '#718096', marginTop: 14, fontSize: 15 },
  errorText: { color: '#fc8181', fontSize: 18, fontWeight: 'bold' },
  errorSub: { color: '#718096', fontSize: 14, marginTop: 6 },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#c9a84c',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: '#0a1628', fontWeight: 'bold' },
});
