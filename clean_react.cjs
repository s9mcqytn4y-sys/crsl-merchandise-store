const fs = require("fs");
const path = require("path");

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== "vendor") {
        walk(fullPath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = walk("./resources/js");
let modifiedCount = 0;

for (const f of files) {
  let content = fs.readFileSync(f, "utf8");
  let orig = content;

  // Check if React is used in body
  const withoutImports = content.split("\n").filter(line => !/^\s*import\s+/.test(line)).join("\n");
  const hasReactInBody = /\bReact\b/.test(withoutImports);

  if (!hasReactInBody) {
    // Replace import React, { ... } from "react"
    content = content.replace(/import\s+React\s*,\s*\{/g, "import {");

    // Replace standalone import React from "react";
    content = content.replace(/^import\s+React\s+from\s+["']react["'];?\r?\n/gm, "");
  }

  if (content !== orig) {
    fs.writeFileSync(f, content, "utf8");
    modifiedCount++;
    console.log("Cleaned React in:", f);
  }
}
console.log("Total files modified:", modifiedCount);
