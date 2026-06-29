import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controllerDir = path.join(__dirname, 'src', 'controllers');
const middlewareDir = path.join(__dirname, 'src', 'middleware');

const updateFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace generic "Server Error" with error.message || "Server Error"
  content = content.replace(
    /res\.status\(500\)\.json\(\{\s*success:\s*false,\s*message:\s*"Server Error[^"]*",?\s*\}\)/g,
    (match) => {
      // Find if error is in scope (catch (error) { ... })
      return match.replace(/"Server Error[^"]*"/, 'error.message || "Server Error"');
    }
  );
  
  // Also handle cases where message is a variable or has different quotes
  content = content.replace(
    /res\.status\(500\)\.json\(\{\s*success:\s*false,\s*message:\s*('|")Server Error[^'"]*\1,?\s*\}\)/g,
    (match, quote) => {
      return match.replace(`${quote}Server Error[^${quote}]*${quote}`, 'error.message || "Server Error"');
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
};

// Process controller files
const controllerFiles = fs.readdirSync(controllerDir);
controllerFiles.forEach(file => {
  if (file.endsWith('.js')) {
    updateFile(path.join(controllerDir, file));
  }
});

// Process middleware files
const middlewareFiles = fs.readdirSync(middlewareDir);
middlewareFiles.forEach(file => {
  if (file.endsWith('.js')) {
    updateFile(path.join(middlewareDir, file));
  }
});

console.log('All files updated!');
