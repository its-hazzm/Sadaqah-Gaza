const fs = require('fs');
const file = 'C:/Users/hp/.gemini/antigravity/scratch/amir-app/screens/HomeScreen.js';
let code = fs.readFileSync(file, 'utf8');

const replacement = `const menuItems = [
  { id: 1, title: 'دعاء للمتوفى', subtitle: 'دعاء مخصص لأمير وأموات المسلمين', screen: 'DuaaMotawafa', color: '#2d6a4f', icon: 'praying-hands', lib: 'FontAwesome5', fullWidth: true },
  { id: 6, title: 'مواقيت الصلاة', subtitle: 'مواعيد الأذان والتنبيهات', screen: 'PrayerTimes', color: '#6d2e6e', icon: 'mosque', lib: 'MaterialCommunityIcons', fullWidth: true },
  { id: 2, title: 'القرآن الكريم', subtitle: 'جميع السور والبحث والتفسير', screen: 'Quran', color: '#c9a84c', icon: 'book-open-page-variant', lib: 'MaterialCommunityIcons' },
  { id: 3, title: 'أذكار الصباح والمساء', subtitle: 'حصن المسلم', screen: 'AzkarCategories', color: '#1d3557', icon: 'shield-sun', lib: 'MaterialCommunityIcons' },
  { id: 4, title: 'أدعية مأثورة', subtitle: 'أدعية نبوية مختارة', screen: 'Adiya', color: '#7b4f12', icon: 'hands', lib: 'FontAwesome5' },
  { id: 5, title: 'أحاديث شريفة', subtitle: 'من رياض الصالحين', screen: 'Ahadith', color: '#1b4332', icon: 'script-text', lib: 'MaterialCommunityIcons' }
];`;

const regex = /const menuItems = \[\s*\{ id: 1,[\s\S]*?\{ id: 5,[\s\S]*?\},?\s*\];/m;
code = code.replace(regex, replacement);

fs.writeFileSync(file, code);
