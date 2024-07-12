const Interface = require('./src/pages/interface.js');
const { dataEXT } = require('./src/pages/utils/extraData.js');
const { projectName } = require('./src/versionData.js');
const fs = require("fs")
cli = new Interface()
cli.display("Login")

// async function run() {
//     await fs.promises.writeFile(`${dataEXT}\\${projectName}\\token.txt`, "", function (err) {});
//     await fs.promises.writeFile(`${dataEXT}\\${projectName}\\proxies.txt`, "", function (err) {});
// }

// run()
