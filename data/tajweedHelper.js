import React from 'react';
import { Text } from 'react-native';

// ألوان أحكام التجويد المعتمدة لمصحف دار المعرفة
export const getTajweedColors = (isDarkMode) => ({
  madd: isDarkMode ? '#f87171' : '#dc2626',      // أحمر: المدود
  ghunnah: isDarkMode ? '#4ade80' : '#15803d',   // أخضر: الغنة والإخفاء والإقلاب
  qalqalah: isDarkMode ? '#38bdf8' : '#0284c7',  // أزرق: القلقلة
  silent: isDarkMode ? '#64748b' : '#9ca3af',    // رمادي: حروف تكتب ولا تلفظ
});

// تعبير نمطي فائق الدقة لرصد أحكام التجويد في الرسم العثماني
const TAJWEED_REGEX = /([\u0622]|[\u0621-\u064A\u0670-\u06D3]?[\u0653])|([نم][\u0651]|[\u06E2]|[\u064B\u064C\u064D]|ن(?=[\u0652\s]*[تثجدذزسشصضطظفقك]))|([قطبجد][\u0652])|([\u0671]|[\u06DF]|ل(?=[\s]*[تثدذرزسشصضطظلن][\u0651]))/g;

// ذاكرة تخزين مؤقت للتحليل الصرفي لتفادي تكرار التعبيرات النمطية وتسريع الأداء
const tajweedCache = new Map();

function parseTajweedSegments(text) {
  if (tajweedCache.has(text)) {
    return tajweedCache.get(text);
  }

  TAJWEED_REGEX.lastIndex = 0;
  let lastIndex = 0;
  const segments = [];
  let match;

  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        type: 'norm',
      });
    }

    const [full, madd, ghunnah, qalqalah, silent] = match;
    let type = 'norm';
    if (madd) type = 'madd';
    else if (ghunnah) type = 'ghunnah';
    else if (qalqalah) type = 'qalqalah';
    else if (silent) type = 'silent';

    segments.push({
      text: full,
      type,
    });

    lastIndex = TAJWEED_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      type: 'norm',
    });
  }

  tajweedCache.set(text, segments);
  return segments;
}

export function renderTajweedVerse(text, defaultColor, colors, baseStyle) {
  if (!text) return null;

  const segments = parseTajweedSegments(text);
  return segments.map((seg, idx) => {
    if (seg.type === 'norm') {
      return (
        <Text key={`norm_${idx}`} style={[baseStyle, { color: defaultColor }]}>
          {seg.text}
        </Text>
      );
    }

    let color = defaultColor;
    if (seg.type === 'madd') color = colors.madd;
    else if (seg.type === 'ghunnah') color = colors.ghunnah;
    else if (seg.type === 'qalqalah') color = colors.qalqalah;
    else if (seg.type === 'silent') color = colors.silent;

    return (
      <Text
        key={`taj_${idx}`}
        style={[baseStyle, { color, fontWeight: seg.type === 'silent' ? 'normal' : 'bold' }]}
      >
        {seg.text}
      </Text>
    );
  });
}
