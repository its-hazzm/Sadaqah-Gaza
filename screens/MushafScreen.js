import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, FlatList, Dimensions, useWindowDimensions, Alert, Platform, Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranData } from '../data/quran_offline';
import { TafsirData } from '../data/tafsir_offline';


const TOTAL_PAGES = 604;
const PAGES_DATA = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

function toArabicNum(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

function groupBySurah(ayahs) {
  const groups = [];
  let current = null;
  for (const ayah of ayahs) {
    if (!current || current.surahNum !== ayah.surah.number) {
      current = { surahNum: ayah.surah.number, surahName: ayah.surah.name, ayahs: [] };
      groups.push(current);
    }
    current.ayahs.push(ayah);
  }
  return groups;
}

const QuranPageContent = memo(({ pageNum, theme, listLayout, fontScale }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [data, setData] = useState(null);
  
  // Dynamic sizing to guarantee it perfectly fits TikTok-style!
  const availableHeight = listLayout ? listLayout.height : Dimensions.get('window').height - 150;
  // A Quran page usually has 15 lines. We divide by ~17 to leave room for borders and headers
  const dynamicLineHeight = Math.floor((availableHeight / 17) * (fontScale || 1)); 
  const dynamicFontSize = Math.floor(dynamicLineHeight * 0.58);
  const dynamicAyahNumSize = Math.floor(dynamicFontSize * 0.8);
  
  const [loading, setLoading] = useState(true);
  const [activeTafsir, setActiveTafsir] = useState(null);
  const lastTapRef = useRef({});

    const shareAyah = async (ayahText, surahName, ayahNum) => {
    try {
      await Share.share({
        message: `﴿${ayahText}﴾\n[سورة ${surahName} - آية ${ayahNum}]\n\n- صدقة جارية عن روح الشهيد أمير محمد نوفل`
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAyahPress = (ayahNum) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[ayahNum] || 0;
    if (now - lastTap < 400) {
      setActiveTafsir(activeTafsir === ayahNum ? null : ayahNum);
    }
    lastTapRef.current[ayahNum] = now;
  };

  useEffect(() => {
    // تحميل الصفحة فورياً وبدون انترنت!
    setData(QuranData[pageNum]);
    setLoading(false);
  }, [pageNum]);

  if (loading || !data) {
    return (
      <View style={[styles.center, { width: SCREEN_WIDTH, height: '100%' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.primary }]}>تحميل صفحة {pageNum} ...</Text>
      </View>
    );
  }

  const groups = groupBySurah(data.ayahs);

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
      {/* Top Header outside the frame */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 6 }}>
        <Text style={{ fontSize: 15, fontFamily: 'Amiri', color: theme.primary, fontWeight: 'bold' }}>الجزء {toArabicNum(data.ayahs[0].juz)}</Text>
        <Text style={{ fontSize: 15, fontFamily: 'Amiri', color: theme.primary, fontWeight: 'bold' }}>سورة {data.ayahs[0].surah.name.replace('سُورَةُ ', '').replace('سورة ', '')}</Text>
      </View>
      <View style={[styles.pageFrameOuter, { borderColor: theme.primary, backgroundColor: theme.primary + '0A' }]}>
        <View style={[styles.pageFrameInner, { borderColor: theme.primary }]}>
        {groups.map((group, idx) => (
          <View key={idx}>
            

            {(group.surahNum !== 1 && group.surahNum !== 9 && group.ayahs[0].numberInSurah === 1) && (
              <Text style={[styles.bismillah, { color: theme.primary }]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
            )}

            <Text style={[styles.versesText, { color: theme.textVerse, fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }]}>
              {group.ayahs.map((ayah) => {
                let text = ayah.text;
                if (group.surahNum !== 1 && ayah.numberInSurah === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
                  text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
                }
                const isTafsir = activeTafsir === ayah.number;
                return (
                  <Text key={ayah.number}>
                    <Text style={[styles.ayahText, { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }]} onPress={() => handleAyahPress(ayah.number)}>
                      {text} <Text style={[styles.ayahNum, { color: theme.primary, fontSize: dynamicAyahNumSize }]}> ﴿{toArabicNum(ayah.numberInSurah)}﴾ </Text>
                    </Text>
                    {isTafsir && (
                      <View style={{ backgroundColor: theme.primary + '1A', padding: 10, borderRadius: 8, marginVertical: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <Text style={[styles.tafsirLabel, { color: theme.primary, fontFamily: 'CairoBold' }]}>التفسير الميسر:</Text>
                          <TouchableOpacity onPress={() => shareAyah(text, group.surahName.replace('سُورَةُ ', ''), ayah.numberInSurah)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Text style={{ color: theme.primary, fontFamily: 'Cairo', fontSize: 12 }}>مشاركة الآية</Text>
                            <MaterialCommunityIcons name="share-variant" size={18} color={theme.primary} />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.tafsirText, { color: theme.textVerse }]} onPress={() => setActiveTafsir(null)}>{TafsirData[pageNum][ayah.number]}</Text>
                      </View>
                    )}
                  </Text>
                );
              })}
            </Text>
          </View>
        ))}

        <View style={styles.pageNumContainer}>
          <View style={[styles.pageNumLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.pageNumText, { color: theme.primary }]}>- {pageNum} -</Text>
          <View style={[styles.pageNumLine, { backgroundColor: theme.border }]} />
        </View>
        
        </View>
      </View>
      <View style={{height: 40}} />
    </ScrollView>
  );
});

export default function MushafScreen({ route, navigation }) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('quranDarkMode').then(val => {
      if (val !== null) setIsDarkMode(val === 'true');
    });
  }, []);

  const toggleDarkMode = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('quranDarkMode', newVal.toString());
  };
  const [isVerticalSwipe, setIsVerticalSwipe] = useState(true); // Default to TikTok mode!
  const [currentPage, setCurrentPage] = useState(route?.params?.page || 1);
  const flatListRef = useRef(null);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem('quranFontScale').then(val => {
      if (val) setFontScale(parseFloat(val));
    });
  }, []);

  const changeFontScale = async (amount) => {
    const newScale = Math.max(0.6, Math.min(2.5, fontScale + amount));
    setFontScale(newScale);
    await AsyncStorage.setItem('quranFontScale', newScale.toString());
  };
  const [listLayout, setListLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 150 });
  
  // To avoid rapid tap bugs
  const isNavigating = useRef(false);

  const saveBookmark = async () => {
    try {
      await AsyncStorage.setItem('quran_bookmark', currentPage.toString());
      if (Platform.OS === 'web') {
        alert('تم حفظ العلامة المرجعية عند الصفحة ' + currentPage);
      } else {
        Alert.alert('تم الحفظ', 'تم حفظ العلامة المرجعية عند الصفحة ' + currentPage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const goNext = () => {
    if (currentPage < TOTAL_PAGES && !isNavigating.current) {
      isNavigating.current = true;
      const next = currentPage + 1;
      setCurrentPage(next);
      flatListRef.current?.scrollToIndex({ index: next - 1, animated: true });
      setTimeout(() => { isNavigating.current = false; }, 300);
    }
  };
  const goPrev = () => {
    if (currentPage > 1 && !isNavigating.current) {
      isNavigating.current = true;
      const prev = currentPage - 1;
      setCurrentPage(prev);
      flatListRef.current?.scrollToIndex({ index: prev - 1, animated: true });
      setTimeout(() => { isNavigating.current = false; }, 300);
    }
  };

  const theme = useMemo(() => ({
    bg: isDarkMode ? '#0b2010' : '#fcf8f2',
    headerBg: isDarkMode ? '#071a0b' : '#ffffff',
    textMain: isDarkMode ? '#ffffff' : '#1a202c',
    textVerse: isDarkMode ? '#e8dcc8' : '#2d3748',
    primary: isDarkMode ? '#c9a84c' : '#2d6a4f',
    navBg: isDarkMode ? '#071a0b' : '#f8f9fa',
    border: isDarkMode ? '#c9a84c66' : '#cbd5e0',
  }), [isDarkMode]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item);
    }
  }, []);
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: isVerticalSwipe ? '100%' : listLayout.width, height: isVerticalSwipe ? listLayout.height : '100%' }}>
      <QuranPageContent pageNum={item} theme={theme} listLayout={listLayout} fontScale={fontScale} />
    </View>
  ), [theme, isVerticalSwipe, listLayout, fontScale]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← رجوع</Text>
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
          <TouchableOpacity onPress={() => changeFontScale(0.08)}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={28} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeFontScale(-0.08)}>
            <MaterialCommunityIcons name="magnify-minus-outline" size={28} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={saveBookmark}>
            <MaterialCommunityIcons name="bookmark-plus" size={28} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsVerticalSwipe(!isVerticalSwipe)}>
            <MaterialCommunityIcons 
              name={isVerticalSwipe ? "view-sequential" : "book-open-page-variant"} 
              size={28} 
              color={theme.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDarkMode}>
            <MaterialCommunityIcons 
              name={isDarkMode ? "weather-night" : "weather-sunny"} 
              size={26} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerPage, { color: theme.primary }]}>صفحة {currentPage}</Text>
      </View>

      <View style={{ flex: 1 }} onLayout={(e) => setListLayout(e.nativeEvent.layout)}>
      <FlatList
        key={isVerticalSwipe ? "V" : "H"}
        extraData={{ theme, isVerticalSwipe, listLayout, fontScale }}
        ref={flatListRef}
        data={PAGES_DATA}
        keyExtractor={item => item.toString()}
        horizontal={!isVerticalSwipe}
        inverted={!isVerticalSwipe}
        pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          updateCellsBatchingPeriod={50}
        initialScrollIndex={currentPage - 1}
        getItemLayout={(data, index) => {
          const size = isVerticalSwipe ? listLayout.height : listLayout.width;
          return { length: size, offset: size * index, index };
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
        windowSize={5}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        removeClippedSubviews={false}
      />
      </View>

      {/* شريط التنقل السفلي */}
      <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={goNext}
          disabled={currentPage >= TOTAL_PAGES}
          style={[styles.navBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, currentPage >= TOTAL_PAGES && styles.navDisabled]}
        >
          <Text style={[styles.navText, { color: theme.primary }]}>← التالية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.progressContainer, { backgroundColor: theme.btnBg, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Quran')}
        >
          <View style={[styles.progressBar, { width: `${(currentPage / TOTAL_PAGES) * 100}%`, backgroundColor: theme.border }]} />
          <Text style={[styles.progressText, { color: theme.primary }]}>صفحة {currentPage} من {TOTAL_PAGES}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goPrev}
          disabled={currentPage <= 1}
          style={[styles.navBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, currentPage <= 1 && styles.navDisabled]}
        >
          <Text style={[styles.navText, { color: theme.primary }]}>السابقة →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1.5,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, fontWeight: 'bold' },
  headerPage: { fontSize: 15, fontWeight: 'bold' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  pageFrameOuter: {
    margin: 14,
    padding: 5,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  pageFrameInner: {
    padding: 18,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  surahHeader: { alignItems: 'center', justifyContent: 'center', marginVertical: 15, paddingVertical: 12, borderRadius: 15, borderWidth: 1 },
  surahHeaderName: { fontSize: 24, fontFamily: 'Amiri', fontWeight: 'bold' },
  bismillah: { fontSize: 24, textAlign: 'center', fontFamily: 'Amiri', lineHeight: 46, marginBottom: 15 },
  versesText: { textAlign: 'justify', writingDirection: 'rtl', lineHeight: 46, paddingHorizontal: 4 },
  ayahText: { fontSize: 23, fontFamily: 'Amiri' },
  ayahNum: { fontSize: 18, fontFamily: 'Amiri' },
  pageNumContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  pageNumLine: { flex: 1, height: 1 },
  pageNumText: { fontSize: 16, paddingHorizontal: 16, fontFamily: 'serif', fontWeight: 'bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 14, fontSize: 15, textAlign: 'center' },
  bottomNav: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', gap: 8, borderTopWidth: 1.5 },
  navBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  navDisabled: { opacity: 0.3 },
  navText: { fontSize: 13, fontWeight: 'bold' },
  progressContainer: { flex: 1, height: 30, borderRadius: 15, overflow: 'hidden', justifyContent: 'center', borderWidth: 1 },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 15 },
  progressText: { fontSize: 11, textAlign: 'center', fontWeight: 'bold' },
});
