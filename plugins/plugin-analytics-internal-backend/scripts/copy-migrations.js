const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'migrations');
const targetDir = path.join(__dirname, '..', 'dist', 'migrations');

// Create dist/migrations directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all files from migrations to dist/migrations
fs.readdirSync(sourceDir).forEach(file => {
  const sourceFile = path.join(sourceDir, file);
  const targetFile = path.join(targetDir, file);
  fs.copyFileSync(sourceFile, targetFile);
});

console.log('Migration files copied successfully!'); 