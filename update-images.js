const fs = require("fs");
const files = fs.readdirSync(".").filter(file => file.endsWith(".html"));
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  let modified = content;
  modified = modified.replace(/data-src="/g, "src=\"");
  if (modified !== content) {
    fs.writeFileSync(file, modified);
    console.log(`Updated ${file}`);
  }
}
