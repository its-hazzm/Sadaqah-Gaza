const fs = require('fs');
const file = 'C:/Users/hp/.gemini/antigravity/scratch/amir-app/screens/MushafScreen.js';
let code = fs.readFileSync(file, 'utf8');

const bottomNavRegex = /<View style=\{styles\.bottomNav\}>[\s\S]*?<\/View>\s*<\/View>/;
const newBottomNav = `<View style={[styles.bottomNav, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          onPress={goNext}
          disabled={pageNum >= TOTAL_PAGES}
          style={[styles.navBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, pageNum >= TOTAL_PAGES && styles.navDisabled]}
        >
          <Text style={[styles.navText, { color: theme.primary }]}>▼ التـالـي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.progressContainer, { backgroundColor: theme.btnBg, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Quran')}
        >
          <View style={[styles.progressBar, { width: \`\${(pageNum / TOTAL_PAGES) * 100}%\`, backgroundColor: theme.border }]} />
          <Text style={[styles.progressText, { color: theme.primary }]}>صفحة {pageNum} من {TOTAL_PAGES} (بحث 🔍)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goPrev}
          disabled={pageNum <= 1}
          style={[styles.navBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, pageNum <= 1 && styles.navDisabled]}
        >
          <Text style={[styles.navText, { color: theme.primary }]}>السابق ▲</Text>
        </TouchableOpacity>
      </View>
    </View>`;

code = code.replace(bottomNavRegex, newBottomNav);

code = code.replace(/<View style=\{styles\.pageNumLine\} \/>/g, '<View style={[styles.pageNumLine, { backgroundColor: theme.border }]} />');
code = code.replace(/<Text style=\{styles\.pageNumText\}>- \{pageNum\} -<\/Text>/g, '<Text style={[styles.pageNumText, { color: theme.primary }]}>- {pageNum} -</Text>');

fs.writeFileSync(file, code);
