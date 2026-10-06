const fs = require('fs');
const https = require('https');

https.get('https://api.alquran.cloud/v1/quran/quran-uthmani', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    const pages = {};
    json.data.surahs.forEach(surah => {
      surah.ayahs.forEach(ayah => {
        const p = ayah.page;
        if (!pages[p]) {
           pages[p] = { ayahs: [] };
        }
        pages[p].ayahs.push({
           number: ayah.number,
           text: ayah.text,
           numberInSurah: ayah.numberInSurah,
           juz: ayah.juz,
           hizbQuarter: ayah.hizbQuarter,
           surah: { number: surah.number, name: surah.name }
        });
      });
    });
    
    // Write to a JS module
    const fileContent = 'export const QuranData = ' + JSON.stringify(pages) + ';';
    fs.writeFileSync('./data/quran_offline.js', fileContent);
    console.log('Successfully saved quran_offline.js (' + (fileContent.length / 1024 / 1024).toFixed(2) + ' MB)');
  });
});
