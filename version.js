const fs = require("fs")
var version = require('./package.json').version;
var data = fs.readFileSync('src/versionData.js', 'utf-8');
var newValue = data.replace(/(?:projectVersion:)[^"]*"([^"]+)"/, `projectVersion: "${version}"`);
fs.writeFileSync('src/versionData.js', newValue, 'utf-8');