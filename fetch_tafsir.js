const fs = require('fs');
const https = require('https');

https.get('https://api.alquran.cloud/v1/quran/ar.muyassar', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    const pages = {};
    json.data.surahs.forEach(surah => {
      surah.ayahs.forEach(ayah => {
        const p = ayah.page;
        if (!pages[p]) {
           pages[p] = {};
        }
        // Save Tafsir mapped by ayah number
        pages[p][ayah.number] = ayah.text;
      });
    });
    
    // Write to a JS module
    const fileContent = 'export const TafsirData = ' + JSON.stringify(pages) + ';';
    fs.writeFileSync('./data/tafsir_offline.js', fileContent);
    console.log('Successfully saved tafsir_offline.js (' + (fileContent.length / 1024 / 1024).toFixed(2) + ' MB)');
  });
});
