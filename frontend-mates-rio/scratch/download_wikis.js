const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'downloaded_svgs');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const downloads = [
  {
    name: 'instituto_wiki.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Escudo_Instituto_Atletico_Central_Cordoba.svg'
  },
  {
    name: 'instituto_alt_wiki.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Instituto_Atletico_Central_Cordoba.svg'
  },
  {
    name: 'central_wiki.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Escudo_del_Club_Atl%C3%A9tico_Rosario_Central.svg'
  },
  {
    name: 'sanlorenzo_wiki.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg'
  }
];

downloads.forEach(d => {
  const file = fs.createWriteStream(path.join(targetDir, d.name));
  https.get(d.url, { headers: { 'User-Agent': 'MatesRioApp/1.0 (contact@matesrio.com)' } }, (res) => {
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded', d.name, fs.statSync(path.join(targetDir, d.name)).size, 'bytes');
    });
  }).on('error', err => console.error('Error on', d.name, err.message));
});
