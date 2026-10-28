import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { MaterialCommunityIcons } from '@expo/vector-icons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function PrayerTimesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [locationName, setLocationName] = useState('جاري تحديد الموقع...');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
    // 0. إنشاء قناة الإشعارات الرسمية لنظام أندرويد لربط صوت أذان الحرم المكي
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('prayer_notifications', {
        name: 'تنبيهات الصلاة والأذان',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'takbeer.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#c9a84c',
      }).catch(e => console.warn('Channel setup bypassed:', e));
    }

    // 1. حساب فوري لمواقيت الصلاة وعرضها مباشرة بدون أي تعليق
    const defaultCoords = new Coordinates(31.5017, 34.4668);
    const date = new Date();
    const params = CalculationMethod.MuslimWorldLeague();
    const initialPrayers = new PrayerTimes(defaultCoords, date, params);
    
    setPrayerTimes(initialPrayers);
    setLocationName('غزة (الموقع الافتراضي)');
    setLoading(false); // إخفاء دائرة التحميل فوراً!

    // 2. محاولة فحص حالة الإشعارات بهدوء في الخلفية
    (async () => {
      try {
        if (Platform.OS !== 'web') {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          if (scheduled && scheduled.length > 0) {
            setNotificationsEnabled(true);
          }
        }
      } catch (e) {
        console.warn('Notifications check bypassed:', e);
      }
    })();

    // 3. محاولة تحديد الموقع الدقيق بالخلفية مع حد أقصى 3 ثوانٍ فقط لمنع أي تعليق
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        // تجربة جلب آخر موقع محفوظ فورياً أولاً
        let location = await Location.getLastKnownPositionAsync({});

        // إذا لم يتوفر، نجلب الموقع الحالي مع مهلة 3 ثوانٍ فقط (Timeout)
        if (!location) {
          const locationPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Location timeout')), 3000)
          );
          location = await Promise.race([locationPromise, timeoutPromise]);
        }

        if (location && location.coords) {
          const accurateCoords = new Coordinates(
            location.coords.latitude,
            location.coords.longitude
          );
          const updatedPrayers = new PrayerTimes(accurateCoords, new Date(), params);
          setPrayerTimes(updatedPrayers);

          // محاولة جلب اسم المدينة بهدوء
          try {
            const reverseGeocode = await Promise.race([
              Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
            ]);
            if (reverseGeocode && reverseGeocode.length > 0) {
              const place = reverseGeocode[0];
              setLocationName(`${place.city || place.region || ''}, ${place.country || ''}`);
            } else {
              setLocationName('موقعك الحالي');
            }
          } catch {
            setLocationName('موقعك الحالي');
          }
        }
      } catch (err) {
        console.warn('Location background update skipped/timed out:', err);
      }
    })();
  }, []);

  const formatTime = (dateObj) => {
    if (!dateObj) return '';
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const schedulePrayerNotifications = async () => {
    if (!prayerTimes || btnLoading) return;

    try {
      setBtnLoading(true);

      if (notificationsEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setNotificationsEnabled(false);
        if (Platform.OS !== 'web') {
          Alert.alert('تم الإيقاف', 'تم إيقاف إشعارات الصلاة بنجاح.');
        } else {
          alert('تم الإيقاف: تم إيقاف إشعارات الصلاة بنجاح.');
        }
        return;
      }

      // التأكد من جاهزية قناة الإشعارات مع صوت الأذان في أندرويد
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer_notifications', {
          name: 'تنبيهات الصلاة والأذان',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'takbeer.mp3',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#c9a84c',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        if (Platform.OS !== 'web') {
          Alert.alert('تنبيه', 'يجب إعطاء صلاحية الإشعارات من إعدادات الهاتف.');
        }
        return;
      }

      // إلغاء أي إشعارات قديمة لتجنب التكرار
      await Notifications.cancelAllScheduledNotificationsAsync();

      const prayersToSchedule = [
        { id: 'fajr', name: 'الفجر', time: prayerTimes.fajr },
        { id: 'dhuhr', name: 'الظهر', time: prayerTimes.dhuhr },
        { id: 'asr', name: 'العصر', time: prayerTimes.asr },
        { id: 'maghrib', name: 'المغرب', time: prayerTimes.maghrib },
        { id: 'isha', name: 'العشاء', time: prayerTimes.isha },
      ];

      if (Platform.OS !== 'web') {
        for (let prayer of prayersToSchedule) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `حان الآن موعد أذان ${prayer.name}`,
              body: 'تطبيق الشهيد أمير نوفل يذكرك بالصلاة',
              sound: 'takbeer.mp3',
              channelId: 'prayer_notifications', // ربط القناة الرسمية لتشغيل صوت الأذان في أندرويد
            },
            trigger: {
              hour: prayer.time.getHours(),
              minute: prayer.time.getMinutes(),
              repeats: true,
            },
          });
        }
      }

      setNotificationsEnabled(true);
      if (Platform.OS !== 'web') {
        Alert.alert('تم التفعيل', 'تم تفعيل إشعارات الصلاة بأذان الحرم المكي بنجاح.');
      } else {
        alert('تم التفعيل (محاكاة): الإشعارات المتكررة تعمل على هواتف الجوال.');
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('خطأ', 'حدث خطأ أثناء تفعيل الإشعارات.');
      }
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#c9a84c" />
        <Text style={styles.loadingText}>جاري حساب مواقيت الصلاة...</Text>
      </View>
    );
  }

  const prayersList = [
    { name: 'الفجر', time: prayerTimes?.fajr, icon: 'weather-sunset-up' },
    { name: 'الشروق', time: prayerTimes?.sunrise, icon: 'weather-sunny' },
    { name: 'الظهر', time: prayerTimes?.dhuhr, icon: 'white-balance-sunny' },
    { name: 'العصر', time: prayerTimes?.asr, icon: 'weather-partly-cloudy' },
    { name: 'المغرب', time: prayerTimes?.maghrib, icon: 'weather-sunset-down' },
    { name: 'العشاء', time: prayerTimes?.isha, icon: 'weather-night' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.locationCard}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#c9a84c" />
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        <View style={styles.timesContainer}>
          {prayersList.map((p, index) => (
            <View key={index} style={styles.timeRow}>
              <View style={styles.prayerNameRow}>
                <MaterialCommunityIcons name={p.icon} size={22} color="#c9a84c" style={styles.prayerIcon} />
                <Text style={styles.prayerName}>{p.name}</Text>
              </View>
              <Text style={styles.prayerTime}>{formatTime(p.time)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.notifyBtn, notificationsEnabled && styles.notifyBtnActive, btnLoading && { opacity: 0.7 }]}
          onPress={schedulePrayerNotifications}
          disabled={btnLoading}
          activeOpacity={0.8}
        >
          {btnLoading ? (
            <ActivityIndicator size="small" color={notificationsEnabled ? "#071a0b" : "#c9a84c"} />
          ) : (
            <MaterialCommunityIcons 
              name={notificationsEnabled ? "bell-check" : "bell-ring"} 
              size={24} 
              color={notificationsEnabled ? "#071a0b" : "#c9a84c"} 
            />
          )}
          <Text style={[styles.notifyText, notificationsEnabled && styles.notifyTextActive]}>
            {btnLoading ? 'جاري المعالجة...' : notificationsEnabled ? 'إيقاف إشعارات الصلاة' : 'تفعيل إشعارات الصلاة'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071a0b',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#c9a84c',
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Cairo',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0a1628',
    borderBottomWidth: 1,
    borderBottomColor: '#c9a84c44',
  },
  backBtn: {
    padding: 5,
  },
  backText: {
    color: '#c9a84c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#f6e05e',
    fontSize: 22,
    fontFamily: 'AmiriBold',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c9a84c',
    marginBottom: 25,
    width: '100%',
    justifyContent: 'center',
  },
  locationText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontFamily: 'Cairo',
    marginLeft: 10,
    textAlign: 'center',
  },
  timesContainer: {
    width: '100%',
    backgroundColor: '#0a1628',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2d6a4f',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 168, 76, 0.2)',
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: 10,
  },
  prayerName: {
    color: '#e2e8f0',
    fontSize: 18,
    fontFamily: 'Cairo',
  },
  prayerTime: {
    color: '#c9a84c',
    fontSize: 20,
    fontFamily: 'AmiriBold',
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a3a1a',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#c9a84c',
    width: '90%',
  },
  notifyBtnActive: {
    backgroundColor: '#c9a84c',
  },
  notifyText: {
    color: '#c9a84c',
    fontSize: 16,
    fontFamily: 'CairoBold',
    marginLeft: 10,
  },
  notifyTextActive: {
    color: '#071a0b',
  }
});
