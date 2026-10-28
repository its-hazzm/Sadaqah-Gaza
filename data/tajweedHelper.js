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

export function renderTajweedVerse(text, defaultColor, colors, baseStyle) {
  if (!text) return null;

  TAJWEED_REGEX.lastIndex = 0;
  let lastIndex = 0;
  const elements = [];
  let match;
  let keyIndex = 0;

  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(
        <Text key={`norm_${keyIndex++}`} style={[baseStyle, { color: defaultColor }]}>
          {text.substring(lastIndex, match.index)}
        </Text>
      );
    }

    const [full, madd, ghunnah, qalqalah, silent] = match;
    let color = defaultColor;
    if (madd) color = colors.madd;
    else if (ghunnah) color = colors.ghunnah;
    else if (qalqalah) color = colors.qalqalah;
    else if (silent) color = colors.silent;

    elements.push(
      <Text key={`taj_${keyIndex++}`} style={[baseStyle, { color, fontWeight: silent ? 'normal' : 'bold' }]}>
        {full}
      </Text>
    );

    lastIndex = TAJWEED_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(
      <Text key={`end_${keyIndex++}`} style={[baseStyle, { color: defaultColor }]}>
        {text.substring(lastIndex)}
      </Text>
    );
  }

  return elements;
}
