import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, StatusBar, ActivityIndicator, FlatList, Dimensions, useWindowDimensions, Alert, Platform, Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranData } from '../data/quran_offline';
import { TafsirData } from '../data/tafsir_offline';
import { surahs } from '../data/surahs';
import { renderTajweedVerse, getTajweedColors } from '../data/tajweedHelper';

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

const QuranPageContent = memo(({ pageNum, theme, listLayout, fontScale, isTajweedEnabled, isDarkMode }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [data, setData] = useState(null);
  
  const availableHeight = listLayout ? listLayout.height : Dimensions.get('window').height - 150;
  const dynamicLineHeight = Math.floor((availableHeight / 17) * (fontScale || 1)); 
  const dynamicFontSize = Math.floor(dynamicLineHeight * 0.58);
  const dynamicAyahNumSize = Math.floor(dynamicFontSize * 0.8);
  
  const tajweedColors = useMemo(() => getTajweedColors(isDarkMode), [isDarkMode]);

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

  const handleAyahPress = (ayah, surahName, text) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[ayah.number] || 0;
    if (now - lastTap < 400) {
      if (activeTafsir && activeTafsir.number === ayah.number) {
        setActiveTafsir(null);
      } else {
        setActiveTafsir({ ...ayah, surahName, cleanText: text });
      }
    }
    lastTapRef.current[ayah.number] = now;
  };

  useEffect(() => {
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
  const pageSurahTitle = [...new Set(groups.map(g => g.surahName.replace('سُورَةُ ', '').replace('سورة ', '')))].join(' • ');

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
      {/* Top Header outside the frame */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 6 }}>
        <Text style={{ fontSize: 15, fontFamily: 'Amiri', color: theme.primary, fontWeight: 'bold' }}>الجزء {toArabicNum(data.ayahs[0].juz)}</Text>
        <Text style={{ fontSize: 15, fontFamily: 'Amiri', color: theme.primary, fontWeight: 'bold' }}>سورة {pageSurahTitle}</Text>
      </View>

      <View style={[styles.pageFrameOuter, { borderColor: theme.primary, backgroundColor: theme.primary + '0A' }]}>
        <View style={[styles.pageFrameInner, { borderColor: theme.primary }]}>
          {groups.map((group, idx) => {
            const surahInfo = surahs.find(s => s.number === group.surahNum) || {};
            const cleanSurahName = group.surahName.replace('سُورَةُ ', '').replace('سورة ', '');

            return (
              <View key={idx}>
                {/* ترويسة السورة العثمانية المزخرفة عند بداية كل سورة */}
                {group.ayahs[0].numberInSurah === 1 && (
                  <View style={[styles.surahBanner, { borderColor: theme.primary, backgroundColor: theme.primary + '14' }]}>
                    <View style={[styles.surahBannerInner, { borderColor: theme.primary }]}>
                      <Text style={[styles.surahBannerOrnament, { color: theme.primary }]}>❖</Text>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.surahBannerTitle, { color: theme.primary }]}>
                          ۞ سُورَةُ {cleanSurahName} ۞
                        </Text>
                        <Text style={[styles.surahBannerMeta, { color: theme.textVerse }]}>
                          الجزء {toArabicNum(group.ayahs[0].juz)} • {surahInfo.revelationType || 'مكية'} • آياتها {toArabicNum(surahInfo.versesCount || group.ayahs.length)}
                        </Text>
                      </View>
                      <Text style={[styles.surahBannerOrnament, { color: theme.primary }]}>❖</Text>
                    </View>
                  </View>
                )}

                {/* البسملة الشريفة لكافة السور عدا الفاتحة (مدمجة بآية 1) والتوبة */}
                {(group.surahNum !== 1 && group.surahNum !== 9 && group.ayahs[0].numberInSurah === 1) && (
                  <Text style={[styles.bismillah, { color: theme.primary }]}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </Text>
                )}

                <Text style={[styles.versesText, { color: theme.textVerse, fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }]}>
                  {group.ayahs.map((ayah) => {
                    let text = ayah.text;
                    if (group.surahNum !== 1 && ayah.numberInSurah === 1) {
                      text = text.replace(/^بّ?ِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s+/, '');
                    }
                    
                    return (
                      <Text key={ayah.number}>
                        <Text 
                          style={[styles.ayahText, { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight }]} 
                          onPress={() => handleAyahPress(ayah, group.surahName, text)}
                        >
                          {isTajweedEnabled
                            ? renderTajweedVerse(text, theme.textVerse, tajweedColors, { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight })
                            : text
                          }
                          <Text style={[styles.ayahNum, { color: theme.primary, fontSize: dynamicAyahNumSize }]}> ﴿{toArabicNum(ayah.numberInSurah)}﴾ </Text>
                        </Text>
                      </Text>
                    );
                  })}
                </Text>
              </View>
            );
          })}

          {/* Page Number */}
          <View style={styles.pageNumContainer}>
            <View style={[styles.pageNumLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.pageNumText, { color: theme.primary }]}>- {pageNum} -</Text>
            <View style={[styles.pageNumLine, { backgroundColor: theme.border }]} />
          </View>

          {/* دليل ألوان التجويد (دار المعرفة) */}
          {isTajweedEnabled && (
            <View style={[styles.tajweedLegend, { borderTopColor: theme.border }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tajweedColors.madd }]} />
                <Text style={[styles.legendText, { color: theme.textVerse }]}>مدود</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tajweedColors.ghunnah }]} />
                <Text style={[styles.legendText, { color: theme.textVerse }]}>غنة وإخفاء</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tajweedColors.qalqalah }]} />
                <Text style={[styles.legendText, { color: theme.textVerse }]}>قلقلة</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tajweedColors.silent }]} />
                <Text style={[styles.legendText, { color: theme.textVerse }]}>لا يُلفظ</Text>
              </View>
            </View>
          )}

        </View>
      </View>
      <View style={{ height: 40 }} />

      {/* Modal للتفسير */}
      <Modal
        visible={activeTafsir !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveTafsir(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            {activeTafsir && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.primary }]}>
                    تفسير الآية ({activeTafsir.numberInSurah}) سورة {activeTafsir.surahName.replace('سُورَةُ ', '').replace('سورة ', '')}
                  </Text>
                  <TouchableOpacity onPress={() => setActiveTafsir(null)}>
                    <MaterialCommunityIcons name="close-circle" size={28} color={theme.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: '80%' }}>
                  <Text style={[styles.modalAyahText, { color: theme.primary }]}>
                    ﴿ {activeTafsir.cleanText} ﴾
                  </Text>
                  <Text style={[styles.modalTafsirText, { color: theme.textVerse }]}>
                    {TafsirData[pageNum] && TafsirData[pageNum][activeTafsir.number]}
                  </Text>
                </ScrollView>

                <TouchableOpacity 
                  style={[styles.modalShareBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} 
                  onPress={() => shareAyah(activeTafsir.cleanText, activeTafsir.surahName.replace('سُورَةُ ', '').replace('سورة ', ''), activeTafsir.numberInSurah)}
                >
                  <MaterialCommunityIcons name="share-variant" size={20} color={theme.primary} />
                  <Text style={[styles.modalShareText, { color: theme.primary }]}>مشاركة التفسير</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
});

export default function MushafScreen({ route, navigation }) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTajweedEnabled, setIsTajweedEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('quranDarkMode').then(val => {
      if (val !== null) setIsDarkMode(val === 'true');
    });
    AsyncStorage.getItem('quranTajweedEnabled').then(val => {
      if (val !== null) setIsTajweedEnabled(val === 'true');
    });
  }, []);

  const toggleDarkMode = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('quranDarkMode', newVal.toString());
  };

  const toggleTajweed = async () => {
    const newVal = !isTajweedEnabled;
    setIsTajweedEnabled(newVal);
    await AsyncStorage.setItem('quranTajweedEnabled', newVal.toString());
  };

  const [isVerticalSwipe, setIsVerticalSwipe] = useState(true);
  const targetPageFromRoute = route?.params?.page ? parseInt(route.params.page) : 1;
  const [currentPage, setCurrentPage] = useState(targetPageFromRoute);
  const flatListRef = useRef(null);
  const [fontScale, setFontScale] = useState(1);
  const [listLayout, setListLayout] = useState(null);
  const isNavigating = useRef(false);

  const scrollToPage = useCallback((pageNum, animated = false) => {
    if (!flatListRef.current || !listLayout) return;
    const idx = Math.max(0, Math.min(TOTAL_PAGES - 1, pageNum - 1));
    const size = isVerticalSwipe ? listLayout.height : listLayout.width;
    try {
      flatListRef.current.scrollToIndex({ index: idx, animated });
    } catch (e) {
      flatListRef.current.scrollToOffset({ offset: idx * size, animated });
    }
  }, [listLayout, isVerticalSwipe]);

  useEffect(() => {
    const pageFromRoute = route?.params?.page ? parseInt(route.params.page) : null;
    if (pageFromRoute && pageFromRoute >= 1 && pageFromRoute <= TOTAL_PAGES) {
      setCurrentPage(pageFromRoute);
      if (listLayout) {
        setTimeout(() => {
          scrollToPage(pageFromRoute, false);
        }, 40);
      }
    }
  }, [route?.params?.page, listLayout, scrollToPage]);

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
      scrollToPage(next, true);
      setTimeout(() => { isNavigating.current = false; }, 300);
    }
  };

  const goPrev = () => {
    if (currentPage > 1 && !isNavigating.current) {
      isNavigating.current = true;
      const prev = currentPage - 1;
      setCurrentPage(prev);
      scrollToPage(prev, true);
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
    btnBg: isDarkMode ? '#0d2b14' : '#edf2f7',
  }), [isDarkMode]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].item);
    }
  }, []);

  const renderItem = useCallback(({ item }) => (
    <View style={{ width: isVerticalSwipe ? '100%' : listLayout.width, height: isVerticalSwipe ? listLayout.height : '100%' }}>
      <QuranPageContent 
        pageNum={item} 
        theme={theme} 
        listLayout={listLayout} 
        fontScale={fontScale} 
        isTajweedEnabled={isTajweedEnabled}
        isDarkMode={isDarkMode}
      />
    </View>
  ), [theme, isVerticalSwipe, listLayout, fontScale, isTajweedEnabled, isDarkMode]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBg} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.primary }]}>← رجوع</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* زر تبديل مصحف التجويد الملون */}
          <TouchableOpacity onPress={toggleTajweed} style={[styles.tajweedToggleBtn, isTajweedEnabled && { borderColor: theme.primary, backgroundColor: theme.primary + '22' }]}>
            <MaterialCommunityIcons 
              name={isTajweedEnabled ? "palette" : "palette-outline"} 
              size={24} 
              color={isTajweedEnabled ? (isDarkMode ? '#f87171' : '#dc2626') : theme.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeFontScale(0.08)}>
            <MaterialCommunityIcons name="magnify-plus-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeFontScale(-0.08)}>
            <MaterialCommunityIcons name="magnify-minus-outline" size={26} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={saveBookmark}>
            <MaterialCommunityIcons name="bookmark-plus" size={26} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsVerticalSwipe(!isVerticalSwipe)}>
            <MaterialCommunityIcons 
              name={isVerticalSwipe ? "view-sequential" : "book-open-page-variant"} 
              size={26} 
              color={theme.primary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleDarkMode}>
            <MaterialCommunityIcons 
              name={isDarkMode ? "weather-night" : "weather-sunny"} 
              size={24} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerPage, { color: theme.primary }]}>صفحة {currentPage}</Text>
      </View>

      {/* FlatList for Pages */}
      <View 
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setListLayout({ width, height });
          }
        }}
      >
        {!listLayout ? (
          <View style={[styles.center, { flex: 1, backgroundColor: theme.bg }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.primary }]}>تحميل المصحف الشريف ...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={PAGES_DATA}
            keyExtractor={(item) => item.toString()}
            renderItem={renderItem}
            horizontal={!isVerticalSwipe}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={currentPage - 1}
            getItemLayout={(data, index) => ({
              length: isVerticalSwipe ? listLayout.height : listLayout.width,
              offset: (isVerticalSwipe ? listLayout.height : listLayout.width) * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              const size = isVerticalSwipe ? listLayout.height : listLayout.width;
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  offset: info.index * size,
                  animated: false,
                });
              }, 50);
            }}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            windowSize={5}
            maxToRenderPerBatch={3}
            removeClippedSubviews={Platform.OS !== 'web'}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          onPress={goNext}
          disabled={currentPage >= TOTAL_PAGES}
          style={[styles.navBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, currentPage >= TOTAL_PAGES && styles.navDisabled]}
        >
          <Text style={[styles.navText, { color: theme.primary }]}>← التالية</Text>
        </TouchableOpacity>

        <View style={[styles.progressContainer, { borderColor: theme.border, backgroundColor: theme.bg }]}>
          <View style={[styles.progressBar, { width: `${(currentPage / TOTAL_PAGES) * 100}%`, backgroundColor: theme.primary + '44' }]} />
          <Text style={[styles.progressText, { color: theme.textMain }]}>صفحة {toArabicNum(currentPage)} من ٦٠٤</Text>
        </View>

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
  tajweedToggleBtn: {
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  pageFrameOuter: {
    margin: 14,
    padding: 5,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  pageFrameInner: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  surahBanner: {
    marginVertical: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 3,
  },
  surahBannerInner: {
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surahBannerTitle: {
    fontSize: 22,
    fontFamily: 'Amiri',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  surahBannerMeta: {
    fontSize: 12,
    fontFamily: 'Cairo',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  surahBannerOrnament: {
    fontSize: 18,
    paddingHorizontal: 4,
  },
  surahHeader: { alignItems: 'center', justifyContent: 'center', marginVertical: 15, paddingVertical: 12, borderRadius: 15, borderWidth: 1 },
  surahHeaderName: { fontSize: 24, fontFamily: 'Amiri', fontWeight: 'bold' },
  bismillah: { fontSize: 24, textAlign: 'center', fontFamily: 'Amiri', lineHeight: 46, marginBottom: 15 },
  versesText: { textAlign: 'justify', writingDirection: 'rtl', lineHeight: 46, paddingHorizontal: 4 },
  ayahText: { fontSize: 23, fontFamily: 'Amiri' },
  ayahNum: { fontSize: 18, fontFamily: 'Amiri' },
  pageNumContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  pageNumLine: { flex: 1, height: 1 },
  pageNumText: { fontSize: 16, paddingHorizontal: 16, fontFamily: 'serif', fontWeight: 'bold' },
  tajweedLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Cairo',
    fontWeight: 'bold',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 14, fontSize: 15, textAlign: 'center' },
  bottomNav: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', gap: 8, borderTopWidth: 1.5 },
  navBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  navDisabled: { opacity: 0.3 },
  navText: { fontSize: 13, fontWeight: 'bold' },
  progressContainer: { flex: 1, height: 30, borderRadius: 15, overflow: 'hidden', justifyContent: 'center', borderWidth: 1 },
  progressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 15 },
  progressText: { fontSize: 11, textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    minHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'CairoBold',
    fontSize: 18,
  },
  modalAyahText: {
    fontFamily: 'Amiri',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  modalTafsirText: {
    fontFamily: 'Cairo',
    fontSize: 17,
    textAlign: 'justify',
    lineHeight: 28,
  },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    gap: 8,
  },
  modalShareText: {
    fontFamily: 'CairoBold',
    fontSize: 16,
  },
});
