const fs = require('fs');
const path = require('path');

const files = [
  'app/admin/delivery-zones/page.tsx',
  'app/admin/combos/page.tsx',
  'app/admin/settings/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove dark: classes
  content = content.replace(/dark:[a-zA-Z0-9/\-\[\]]+/g, '');
  // Clean up extra spaces
  content = content.replace(/  +/g, ' ');
  // Clean up trailing spaces in class strings
  content = content.replace(/ \)/g, ')');
  content = content.replace(/ "/g, '"');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});
