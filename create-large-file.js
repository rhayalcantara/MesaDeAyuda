const fs = require('fs');
const filePath = '/tmp/large_test_file.pdf';
const size = 15 * 1024 * 1024; // 15MB
fs.writeFileSync(filePath, Buffer.alloc(size));
console.log('Created file:', filePath, 'Size:', size, 'bytes');
