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
      html = html.replace('<title>صدقة - Gaza</title>', `<title>صدقة - Gaza</title>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="صدقة" />
    <link rel="apple-touch-icon" href="/Sadaqah-Gaza/icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
    <style id="expo-vector-icons-fonts">
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url('/Sadaqah-Gaza/fonts/MaterialCommunityIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5Free-Solid';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Solid.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5_Solid';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Solid.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5Free-Regular';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5_Regular';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Regular.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5Free-Brand';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Brands.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome5_Brands';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome5_Brands.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome';
        src: url('/Sadaqah-Gaza/fonts/FontAwesome.ttf') format('truetype');
      }
      @font-face {
        font-family: 'MaterialIcons';
        src: url('/Sadaqah-Gaza/fonts/MaterialIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Ionicons';
        src: url('/Sadaqah-Gaza/fonts/Ionicons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'Feather';
        src: url('/Sadaqah-Gaza/fonts/Feather.ttf') format('truetype');
      }
    </style>`);
    }
    // Make bundle and asset links point to /Sadaqah-Gaza/ for GitHub Pages
    html = html.replace(/src="(\.\/|\/)bundles\//g, 'src="/Sadaqah-Gaza/bundles/');
    html = html.replace(/href="(\.\/|\/)favicon\.ico"/g, 'href="/Sadaqah-Gaza/favicon.ico"');
    html = html.replace(/href="(\.\/|\/)icon\.png"/g, 'href="/Sadaqah-Gaza/icon.png"');
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Updated paths to /Sadaqah-Gaza/ in dist/index.html');
  }

  // Duplicate assets/node_modules to assets/modules so Git and GitHub Pages never ignore them
  const nodeModulesDir = path.join(distDir, 'assets', 'node_modules');
  const modulesDir = path.join(distDir, 'assets', 'modules');
  if (fs.existsSync(nodeModulesDir)) {
    fs.cpSync(nodeModulesDir, modulesDir, { recursive: true });
    console.log('Copied assets/node_modules to assets/modules');
  }

  const bundlesDir = path.join(distDir, 'bundles');
  if (fs.existsSync(bundlesDir)) {
    const bundleFiles = fs.readdirSync(bundlesDir);
    for (const file of bundleFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(bundlesDir, file);
        let code = fs.readFileSync(filePath, 'utf8');
        code = code.replace(/"\/assets\//g, '"/Sadaqah-Gaza/assets/');
        code = code.replace(/\/assets\/node_modules\//g, '/assets/modules/');
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

  // Copy vector icon fonts to dist/fonts
  const vectorFontsSrc = path.join(__dirname, 'node_modules', '@expo', 'vector-icons', 'build', 'vendor', 'react-native-vector-icons', 'Fonts');
  const fontsDest = path.join(distDir, 'fonts');
  if (fs.existsSync(vectorFontsSrc)) {
    if (!fs.existsSync(fontsDest)) {
      fs.mkdirSync(fontsDest, { recursive: true });
    }
    const fontFiles = fs.readdirSync(vectorFontsSrc);
    for (const f of fontFiles) {
      fs.copyFileSync(path.join(vectorFontsSrc, f), path.join(fontsDest, f));
    }
    console.log(`Copied ${fontFiles.length} vector icon fonts to dist/fonts`);
  }

  // Copy image assets to guarantee accessibility across all resolution paths
  const assetsDir = path.join(distDir, 'assets');
  const assetsAssetsDir = path.join(assetsDir, 'assets');
  if (!fs.existsSync(assetsAssetsDir)) {
    fs.mkdirSync(assetsAssetsDir, { recursive: true });
  }

  ['amir.jpg', 'splash.jpg'].forEach(imgName => {
    const src = path.join(__dirname, 'assets', imgName);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(distDir, imgName));
      fs.copyFileSync(src, path.join(assetsDir, imgName));
      fs.copyFileSync(src, path.join(assetsAssetsDir, imgName));
      console.log(`Copied ${imgName} to dist, dist/assets, and dist/assets/assets`);
    }
  });

  const redirectsPath = path.join(distDir, '_redirects');
  fs.writeFileSync(redirectsPath, '/*    /index.html   200\n', 'utf8');

  const nojekyllPath = path.join(distDir, '.nojekyll');
  fs.writeFileSync(nojekyllPath, '', 'utf8');
  console.log('Created dist/.nojekyll');
}
