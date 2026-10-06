import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 1, title: 'دعاء للمتوفى', subtitle: 'دعاء مخصص لأمير وأموات المسلمين', screen: 'DuaaMotawafa', color: '#2d6a4f', icon: 'praying-hands', lib: 'FontAwesome5', fullWidth: true },
  { id: 6, title: 'مواقيت الصلاة', subtitle: 'مواعيد الأذان والتنبيهات', screen: 'PrayerTimes', color: '#6d2e6e', icon: 'mosque', lib: 'MaterialCommunityIcons', fullWidth: true },
  { id: 2, title: 'القرآن الكريم', subtitle: 'جميع السور والبحث والتفسير', screen: 'Quran', color: '#c9a84c', icon: 'book-open-page-variant', lib: 'MaterialCommunityIcons' },
  { id: 3, title: 'أذكار الصباح والمساء', subtitle: 'حصن المسلم', screen: 'AzkarCategories', color: '#1d3557', icon: 'shield-sun', lib: 'MaterialCommunityIcons' },
  { id: 4, title: 'أدعية مأثورة', subtitle: 'أدعية نبوية مختارة', screen: 'Adiya', color: '#7b4f12', icon: 'hands', lib: 'FontAwesome5' },
  { id: 5, title: 'أحاديث شريفة', subtitle: 'من رياض الصالحين', screen: 'Ahadith', color: '#1b4332', icon: 'script-text', lib: 'MaterialCommunityIcons' }
];

export default function HomeScreen({ navigation }) {
  const renderIcon = (item) => {
    if (item.lib === 'FontAwesome5') {
      return <FontAwesome5 name={item.icon} size={28} color={item.color} />;
    }
    return <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#071220" />
      
      {/* خلفية الصفحة */}
      <LinearGradient
        colors={['#071220', '#0a1628', '#071a0b']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
      {/* Header */}
      <LinearGradient
        colors={['#c9a84c22', 'transparent']}
        style={styles.header}
      >
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        
        <View style={styles.dedicationBox}>
          <LinearGradient
            colors={['#1a2f4e', '#0d1f3c']}
            style={styles.dedicationGradient}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="seedling" size={20} color="#c9a84c" />
            </View>
            <Text style={styles.dedicationTitle}إ > إهداء إلى روح الشهيد بإذن الله تعالى </Text>
            <Text style={styles.dedicationName}>أمير محمد نوفل</Text>
            <Text style={styles.dedicationGaza}>وأرواح شهداء وأموات الشعب الفلسطيني في غزة</Text>
            <Text style={styles.dedicationDua}>اللهم اغفر لهم وارحمهم وأسكنهم فسيح جناتك</Text>
          </LinearGradient>
        </View>

        <Text style={styles.ayah}>
          ﴿ وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللَّهِ أَمْوَاتًا ۚ بَلْ أَحْيَاءٌ عِندَ رَبِّهِمْ يُرْزَقُونَ ﴾
        </Text>
      </LinearGradient>

            {/* صورة الشهيد */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/amir.jpg')} 
            style={styles.amirImage} 
          />
        </View>

        {/* Menu Grid */}
        <View style={styles.scrollContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>القائمة الرئيسية</Text>
          <View style={styles.titleLine} />
        </View>

        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.cardWrapper, item.fullWidth && { width: '100%' }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1a2f4e', '#11223a']}
                style={[styles.card, { borderBottomColor: item.color, borderBottomWidth: 4 }]}
              >
                <View style={styles.cardIconBox}>
                  {renderIcon(item)}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>صدقة جارية 🤍</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
    imageContainer: {
      alignItems: 'center',
      marginTop: 0,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 8,
    },
    amirImage: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderWidth: 3,
      borderColor: '#c9a84c',
    },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c33',
  },
  bismillah: {
    color: '#c9a84c',
    fontSize: 22,
    fontFamily: 'Amiri',
    marginBottom: 20,
    textAlign: 'center',
  },
  dedicationBox: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
  },
  dedicationGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c9a84c44',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c9a84c15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c9a84c33',
  },
  dedicationTitle: {
    color: '#a0aec0',
    fontSize: 16,
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  dedicationName: {
    color: '#e2e8f0',
    fontSize: 26,
    fontFamily: 'CairoBold',
    marginBottom: 4,
  },
  dedicationGaza: {
    color: '#e2e8f0',
    fontSize: 15,
    fontFamily: 'CairoBold',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  dedicationDua: {
    color: '#c9a84c',
    fontSize: 15,
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
  ayah: {
    color: '#cbd5e0',
    fontSize: 18,
    fontFamily: 'Amiri',
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 10,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontFamily: 'CairoBold',
    marginRight: 15,
  },
  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c9a84c44',
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: (width - 55) / 2, // 2 columns
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    height: 145,
  },
  cardIconBox: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontFamily: 'CairoBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSub: {
    color: '#a0aec0',
    fontSize: 11,
    fontFamily: 'Cairo',
    textAlign: 'center',
  },

  footer: {
    marginTop: 20,
    alignItems: 'center',
    opacity: 0.6,
  },
  footerText: {
    color: '#c9a84c',
    fontSize: 14,
    fontFamily: 'Cairo',
  },
});
