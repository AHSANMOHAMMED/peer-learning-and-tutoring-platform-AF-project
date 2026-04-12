const fs = require('fs');
const path = require('path');

const directory = './frontend/src/views';

const JARGON_MAP = [
  { search: /_NOMINAL/g, replace: '' },
  { search: / SYNC_NOMINAL/g, replace: '' },
  { search: /NOMINAL/g, replace: 'OK' },
  { search: /SYNC_OK/g, replace: 'OK' },
  { search: /SYNC_/g, replace: '' },
  { search: /IDENTITY_NODE/g, replace: 'PROFILE' },
  { search: /_NODE/g, replace: '' },
  { search: / NODE/g, replace: '' },
  { search: /SOVEREIGN_HUB/gi, replace: 'Platform' },
  { search: /SOVEREIGN_PROTOCOLS_XI/gi, replace: 'System Protocols' },
  { search: /SOVEREIGN/g, replace: 'GLOBAL' },
  { search: /NEURAL_AI_CORE/gi, replace: 'AI Protocol' },
  { search: /SYLLABUS_MATRIX/gi, replace: 'Syllabus' },
  { search: /AURA_CYBER_DOMAIN_XI/gi, replace: 'Aura Platform' },
  { search: /MATRIX/g, replace: 'GRID' },
  { search: /_XI/g, replace: '' },
  { search: /_SECURE/g, replace: '' },
  { search: /_ACTIVE/g, replace: '' },
  { search: /_OK/g, replace: '' },
  { search: /_DESC/g, replace: '' }
];

function processPath(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    files.forEach(file => {
      processPath(path.join(targetPath, file));
    });
  } else if (stat.isFile() && targetPath.endsWith('.jsx')) {
    let content = fs.readFileSync(targetPath, 'utf8');
    let original = content;
    
    JARGON_MAP.forEach(({search, replace}) => {
      content = content.replace(search, replace);
    });

    if (content !== original) {
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log(`Cleaned: ${targetPath}`);
    }
  }
}

processPath(directory);
console.log("Cleanup complete!");
