import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirs = [
  path.join(__dirname, "src", "controllers"),
  path.join(__dirname, "src", "middleware"),
];

const replacementExpression = "error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error))";

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 1. Replace: message: error.message || "Server Error"
  //            message: error.message || 'Server Error'
  const pattern1 = /message:\s*error\.message\s*\|\|\s*["']Server Error[^"']*["']/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, `message: ${replacementExpression}`);
    modified = true;
  }

  // 2. Replace: message: "Server Error" (inside catch blocks where error is defined)
  // We look for res.status(...).json({ success: false, message: "Server Error" }) or similar
  const pattern2 = /message:\s*["']Server Error[^"']*["']/g;
  if (pattern2.test(content)) {
    // Only replace if 'error' is likely in scope
    if (content.includes("catch") || content.includes("err")) {
      content = content.replace(pattern2, (match) => {
        // If 'err' is used instead of 'error'
        const errVar = content.includes("catch (err)") || content.includes("catch(err)") ? "err" : "error";
        const replacement = `${errVar}.message || (${errVar} && typeof ${errVar} === 'object' ? JSON.stringify(${errVar}) : String(${errVar}))`;
        return `message: ${replacement}`;
      });
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated error messages in: ${filePath}`);
  }
};

dirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        processFile(path.join(dir, file));
      }
    });
  }
});

console.log("Error message migration script completed.");
