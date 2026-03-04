const fs = require('fs');
const path = require('path');

const buildInfo = {
  version: '0.1.0',
  buildTime: new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }),
  buildDate: new Date().toISOString()
};

const outputPath = path.join(__dirname, '../src/build-info.json');
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2), 'utf-8');

console.log('✅ Build info generated:', buildInfo.buildTime);
