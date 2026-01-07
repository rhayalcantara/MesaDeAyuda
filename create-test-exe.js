const fs = require('fs');
const filePath = '/tmp/test_malware.exe';
fs.writeFileSync(filePath, Buffer.from('This is not a real exe file'));
console.log('Created file:', filePath);
