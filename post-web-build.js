const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  const iconSrc = path.join(__dirname, 'assets', 'icon.png');
  const iconDest = path.join(distDir, 'icon.png');
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDest);
    console.log('Copied icon.png to dist');
  }

  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    if (!html.includes('apple-mobile-web-app-capable')) {
      html = html.replace('<title>صدقة - Gaza</title>', '<title>صدقة - Gaza</title>\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="apple-mobile-web-app-title" content="صدقة" />\n    <link rel="apple-touch-icon" href="/icon.png" />');
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Injected iOS PWA tags into dist/index.html');
    }
  }

  const redirectsPath = path.join(distDir, '_redirects');
  fs.writeFileSync(redirectsPath, '/*    /index.html   200\n', 'utf8');
}
