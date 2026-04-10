import fs from 'fs';

const filePath = './src/CGPAVision.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the corrupted icon in dashboard
content = content.replace(
  /className="text-xl">[^<]*<\/span>/,
  'className="text-xl animate-bounce" style={{ animationDuration: \'2s\' }}>📚</span>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard icon fixed!');


