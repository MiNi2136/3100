import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, 'src', 'pages');
const apiPattern = /axios\.(?:get|post|put|delete|patch)\s*\(\s*["']http:\/\/localhost:5050(\/[^"']+)["']/g;

const replaceApiCalls = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace axios imports with api import
  let updatedContent = content.replace(
    /import\s+axios\s+from\s+["']axios["'];/g,
    `import api from "../api";`
  );
  
  // Replace axios API calls
  updatedContent = updatedContent.replace(apiPattern, `api.post("$1"`);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated: ${filePath}`);
  }
};

const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      replaceApiCalls(filePath);
    }
  });
};

processDirectory(frontendDir);
console.log('API conversion complete!');
