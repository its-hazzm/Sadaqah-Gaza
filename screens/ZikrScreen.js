import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from 'react-native';

export default function ZikrScreen({ route, navigation }) {
  const { title, data, color = '#2d6a4f', isHadith = false, isDuaa = false } = route.params;
  const [counters, setCounters] = useState({});

  const increment = (id, maxCount) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      if (current >= maxCount) {
        Alert.alert('أحسنت! ✅', 'لقد أكملت هذا الذكر 🤍');
        return prev;
      }
      return { ...prev, [id]: current + 1 };
    });
  };

  const reset = (id) => {
    setCounters((prev) => ({ ...prev, [id]: 0 }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>→ رجوع</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {data.map((item) => {
          const current = counters[item.id] || 0;
          const max = item.count || 1;
          const done = current >= max;

          return (
            <View key={item.id} style={[styles.card, done && styles.cardDone]}>
              {/* Title */}
              <Text style={[styles.cardTitle, { color }]}>{item.title}</Text>

              {/* Text */}
              <Text style={styles.cardText}>{item.text}</Text>

              {/* Source / Virtue */}
              {item.source && (
                <Text style={styles.source}>{item.source}</Text>
              )}

              {/* Counter for azkar */}
              {!isHadith && !isDuaa && (
                <View style={styles.counterRow}>
                  <TouchableOpacity onPress={() => reset(item.id)} style={styles.resetBtn}>
                    <Text style={styles.resetText}>إعادة</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => increment(item.id, max)}
                    style={[styles.countBtn, { backgroundColor: done ? '#2d6a4f' : color }]}
                    disabled={done}
                  >
                    <Text style={styles.countBtnText}>
                      {done ? '✅ تم' : `${current} / ${max}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    backgroundColor: '#0d1f3c',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
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
  scroll: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#1a2f4e',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ffffff11',
  },
  cardDone: {
    borderColor: '#2d6a4f',
    backgroundColor: '#1a3a2a',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'CairoBold',
    textAlign: 'right',
    marginBottom: 10,
  },
  cardText: {
    color: '#e2e8f0',
    fontSize: 20,
    lineHeight: 38,
    textAlign: 'right',
    fontFamily: 'Amiri',
  },
  source: {
    color: '#c9a84c',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
    fontFamily: 'Cairo',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  countBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  countBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  resetText: { color: '#a0aec0', fontSize: 14 },
});
