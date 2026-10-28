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
      html = html.replace('<title>صدقة - Gaza</title>', '<title>صدقة - Gaza</title>\n    <meta name="apple-mobile-web-app-capable" content="yes" />\n    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n    <meta name="apple-mobile-web-app-title" content="صدقة" />\n    <link rel="apple-touch-icon" href="./icon.png" />');
    }
    // Make bundle and asset links point to /Sadaqah-Gaza/ for GitHub Pages
    html = html.replace(/src="(\.\/|\/)bundles\//g, 'src="/Sadaqah-Gaza/bundles/');
    html = html.replace(/href="(\.\/|\/)favicon\.ico"/g, 'href="/Sadaqah-Gaza/favicon.ico"');
    html = html.replace(/href="(\.\/|\/)icon\.png"/g, 'href="/Sadaqah-Gaza/icon.png"');
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Updated paths to /Sadaqah-Gaza/ in dist/index.html');
  }

  const bundlesDir = path.join(distDir, 'bundles');
  if (fs.existsSync(bundlesDir)) {
    const bundleFiles = fs.readdirSync(bundlesDir);
    for (const file of bundleFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(bundlesDir, file);
        let code = fs.readFileSync(filePath, 'utf8');
        code = code.replace(/"\/assets\//g, '"/Sadaqah-Gaza/assets/');
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`Patched asset subpath in ${file}`);
      }
    }
  }

  const notFoundPath = path.join(distDir, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('Created dist/404.html for SPA routing');
  }

  const redirectsPath = path.join(distDir, '_redirects');
  fs.writeFileSync(redirectsPath, '/*    /index.html   200\n', 'utf8');
}
