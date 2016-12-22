// module.exports = require('./lib/Aurelion');

const fs = require('fs');
const path = require('path');
const { ALWindow } = require('./lib/AurelionWindow');

function main() {
  let configPath = path.resolve('./aurelion.json');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  if (!config['entrance']) {
    console.error('Error: aurelion.json file has no "entrance" name.');
    return ;
  }
  let windowTitle = '';
  if (config['window']) {
      windowTitle = config['window']['title'] ? config['window']['title'] : '';
  }
  // let renderMainFile = path.resolve(config['entrance']);
  let renderMainFile = config['entrance'];

  let html = '<!DOCTYPE html>' +
    `<html><head><meta charset="UTF-8"><title>${windowTitle}</title>` +
    '<style>body{margin:0;padding:0;border:0}canvas{display:block}</style></head>' +
    `<body></body><script src="${renderMainFile}"></script></html>`;

  fs.writeFileSync('entrance.html', html);

  ALWindow.init();
  ALWindow.run();
}

main();
