const fs = require('fs');
const glob = require('glob');
const { SitemapStream, streamToPromise } = require('sitemap');

// Apni website ka main URL yahan likhein
const BASE_URL = 'https://zenvora-4vgs.vercel.app/';

async function generateSitemap() {
  const smStream = new SitemapStream({ hostname: BASE_URL });

  // Saari HTML files ko search karein (node_modules ko chhod kar)
  const files = glob.sync('**/*.html', { ignore: 'node_modules/**' });

  files.forEach((file) => {
    // index.html ko root '/' banayein, baki pages ke liye path normalize karein
    let route = file === 'index.html' ? '' : file.replace('.html', '');
    if (route.endsWith('/index')) {
      route = route.replace('/index', '');
    }

    smStream.write({
      url: `/${route}`,
      changefreq: 'weekly',
      priority: route === '' ? 1.0 : 0.8,
      lastmod: new Date().toISOString()
    });
  });

  smStream.end();

  const sitemapHtml = await streamToPromise(smStream);
  
  // public/ ya root folder mein sitemap.xml save karein
  fs.writeFileSync('./public/sitemap.xml', sitemapHtml.toString());
  console.log('✅ Sitemap updated successfully!');
}

generateSitemap();
