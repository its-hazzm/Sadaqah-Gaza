import React, { useState } from 'react';
import { QuranData } from '../data/quran_offline';
import { TafsirData } from '../data/tafsir_offline';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, StatusBar, TextInput,
  ActivityIndicator, Keyboard,
} from 'react-native';

export default function QuranSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);

  // 1. تسوية عثمانية تقليدية (حذف الألف الخنجرية)
  const normUthmani = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0670]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim()
      .replace(/\s+/g, ' ');
  };

  // 2. تسوية إملائية حديثة وذكية (تحويل الألف الخنجرية والرسم العثماني لإملاء معاصر)
  const normModern = (text) => {
    if (!text) return '';
    return text
      .replace(/\u0670\u0648/g, 'ا') // الصلاة والزكاة والحياة
      .replace(/\u0670/g, 'ا')   // أعطيناك، إبراهيم، إسماعيل، مالك
      .replace(/[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim()
      .replace(/\s+/g, ' ');
  };

  const search = () => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    Keyboard.dismiss();

    setLoading(true);
    setError(false);
    setSearched(true);
    
    setTimeout(() => {
      try {
        const q1 = normUthmani(q);
        const q2 = normModern(q);
        const matches = [];

        for (let p = 1; p <= 604; p++) {
          const pageAyahs = QuranData[p]?.ayahs;
          if (!pageAyahs) continue;
          
          for (let ayah of pageAyahs) {
            let textToSearch = ayah.text;
            if (ayah.surah.number !== 1 && ayah.numberInSurah === 1 && textToSearch.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
              textToSearch = textToSearch.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
            }
            
            const a1 = normUthmani(textToSearch);
            const a2 = normModern(textToSearch);

            // مطابقة مرنة فائقة الذكاء (سواء كتب المستخدم إملاء حديثاً أو عثمانياً)
            const isMatch = a1.includes(q1) || a2.includes(q1) || a1.includes(q2) || a2.includes(q2);

            if (isMatch) {
              matches.push({
                number: ayah.number,
                numberInSurah: ayah.numberInSurah,
                surah: ayah.surah,
                page: p,
                uthmaniText: textToSearch,
                cleanText: a2,
                tafsir: (TafsirData[p] && TafsirData[p][ayah.number]) ? TafsirData[p][ayah.number] : 'لا يوجد تفسير متاح'
              });
              if (matches.length >= 30) break;
            }
          }
          if (matches.length >= 30) break;
        }

        setResults(matches);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const highlightText = (text, keyword) => {
    if (!keyword) return <Text style={styles.ayahText}>{text}</Text>;
    const cleanWord = keyword.trim();
    const parts = text.split(new RegExp(`(${cleanWord})`, 'gi'));
    return (
      <Text style={styles.ayahText}>
        {parts.map((part, i) =>
          part.toLowerCase() === cleanWord.toLowerCase() ? (
            <Text key={i} style={styles.highlighted}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const goToVerse = (item) => {
    navigation.navigate('Mushaf', {
      page: item.page, // رقم الصفحة الفعلي
      targetAyah: item.number, // رقم الآية الكلي
      targetAyahInSurah: item.numberInSurah,
      targetSurah: item.surah.number,
      targetSurahName: item.surah.name,
      targetAyahText: item.uthmaniText,
      targetTafsir: item.tafsir,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071a0b" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>→ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 البحث في القرآن والتفسير</Text>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="اكتب كلمة أو جملة من الآية..."
          placeholderTextColor="#718096"
          value={query}
          onChangeText={setQuery}
          textAlign="right"
          returnKeyType="search"
          onSubmitEditing={search}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
          onPress={search}
          disabled={!query.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0a1628" />
          ) : (
            <Text style={styles.searchBtnText}>بحث</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Hint */}
      {!searched && (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>💡 ابحث عن أي آية بسهولة</Text>
          <Text style={styles.hintText}>اكتب أي جزء من الآية (مع التشكيل أو بدونه) مثل:</Text>
          <Text style={styles.hintExample}>«إنا أعطيناك الكوثر»</Text>
          <Text style={styles.hintExample}>«الرحمن على العرش استوى»</Text>
          <Text style={styles.hintExample}>«ألا بذكر الله تطمئن القلوب»</Text>
          <Text style={styles.hintSub}>
            ستظهر لك الآية مع السورة ورقمها، وشرحها الميسر، ورابط مباشر يفتح الآية داخل المصحف.
          </Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#c9a84c" />
          <Text style={styles.loadingText}>جارٍ البحث وجلب الآيات والتفسير...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠️ تعذّر الاتصال</Text>
          <Text style={styles.errorSub}>تحقق من اتصال الإنترنت وأعد المحاولة</Text>
        </View>
      )}

      {/* No Results */}
      {searched && !loading && !error && results.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.noResultIcon}>🔍</Text>
          <Text style={styles.noResultText}>لم يتم العثور على نتائج</Text>
          <Text style={styles.noResultSub}>تأكد من صحة الكلمات وجرب البحث بكلمة أقصر</Text>
        </View>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              تم العثور على {results.length} آية • اضغط على الآية للانتقال لموضعها في المصحف
            </Text>
          </View>

          <FlatList
            data={results}
            keyExtractor={item => String(item.number)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => goToVerse(item)}
                activeOpacity={0.88}
              >
                {/* معلومات السورة والآية والصفحة */}
                <View style={styles.cardHeader}>
                  <View style={styles.surahTag}>
                    <Text style={styles.surahTagText}>
                      سورة {item.surah.name}
                    </Text>
                  </View>
                  <View style={styles.metaTagsRow}>
                    <View style={styles.metaTag}>
                      <Text style={styles.metaTagText}>آية {item.numberInSurah}</Text>
                    </View>
                    <View style={[styles.metaTag, styles.pageTag]}>
                      <Text style={[styles.metaTagText, styles.pageTagText]}>
                        صفحة {item.page}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* نص الآية بالرسم العثماني */}
                <View style={styles.ayahBox}>
                  {highlightText(item.uthmaniText, query.trim())}
                </View>

                {/* التفسير الميسر */}
                <View style={styles.tafsirBox}>
                  <Text style={styles.tafsirLabel}>📖 التفسير الميسر:</Text>
                  <Text style={styles.tafsirText}>{item.tafsir}</Text>
                </View>

                {/* زر الانتقال لموضع الآية */}
                <View style={styles.goBtn}>
                  <Text style={styles.goBtnText}>
                    ← الانتقال إلى سورة {item.surah.name} (آية {item.numberInSurah}) في المصحف
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
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
  backBtn: { marginLeft: 10, padding: 4 },
  backText: { color: '#c9a84c', fontSize: 16, fontWeight: 'bold' },
  headerTitle: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'serif',
  },

  searchBox: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    backgroundColor: '#0d1f3c',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1a2f4e',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#c9a84c44',
  },
  searchBtn: {
    backgroundColor: '#c9a84c',
    paddingHorizontal: 22,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { color: '#0a1628', fontWeight: 'bold', fontSize: 15 },

  hintBox: {
    margin: 16,
    backgroundColor: '#1a2f4e',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#c9a84c22',
    alignItems: 'center',
  },
  hintTitle: { color: '#c9a84c', fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  hintText: { color: '#a0aec0', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  hintExample: {
    color: '#e2e8f0',
    fontSize: 15,
    fontFamily: 'serif',
    backgroundColor: '#0d1f3c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 4,
    textAlign: 'center',
    width: '100%',
  },
  hintSub: {
    color: '#718096',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 20,
  },

  resultsHeader: {
    backgroundColor: '#0d1f3c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff10',
  },
  resultsCount: {
    color: '#c9a84c',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  list: { padding: 14, paddingBottom: 40 },

  resultCard: {
    backgroundColor: '#1a2f4e',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#c9a84c33',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surahTag: {
    backgroundColor: '#c9a84c22',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c9a84c66',
  },
  surahTagText: {
    color: '#c9a84c',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  metaTagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metaTag: {
    backgroundColor: '#0d1f3c',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  metaTagText: { color: '#a0aec0', fontSize: 12, fontWeight: 'bold' },
  pageTag: {
    backgroundColor: '#2d6a4f33',
    borderColor: '#2d6a4f',
  },
  pageTagText: { color: '#68d391' },

  ayahBox: {
    backgroundColor: '#071a0b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderRightWidth: 4,
    borderRightColor: '#c9a84c',
  },
  ayahText: {
    color: '#f7fafc',
    fontSize: 20,
    lineHeight: 42,
    textAlign: 'right',
    fontFamily: 'serif',
  },
  highlighted: {
    color: '#f6e05e',
    fontWeight: 'bold',
    backgroundColor: '#c9a84c44',
  },

  tafsirBox: {
    backgroundColor: '#0d1f3c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2d6a4f55',
  },
  tafsirLabel: {
    color: '#68d391',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  tafsirText: {
    color: '#cbd5e0',
    fontSize: 14,
    lineHeight: 26,
    textAlign: 'right',
  },

  goBtn: {
    backgroundColor: '#c9a84c',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBtnText: {
    color: '#071a0b',
    fontSize: 13,
    fontWeight: 'bold',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { color: '#c9a84c', marginTop: 14, fontSize: 15, textAlign: 'center' },
  errorText: { color: '#fc8181', fontSize: 18, fontWeight: 'bold' },
  errorSub: { color: '#718096', fontSize: 14, marginTop: 6, textAlign: 'center' },
  noResultIcon: { fontSize: 44, marginBottom: 12 },
  noResultText: { color: '#e2e8f0', fontSize: 18, fontWeight: 'bold' },
  noResultSub: { color: '#718096', fontSize: 14, marginTop: 6, textAlign: 'center' },
});
