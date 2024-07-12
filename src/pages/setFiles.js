const {
    projectName
} = require("../versionData");
const {
    dataEXT
} = require("./utils/extraData");
const fs = require('fs');

class SetFiles {

    static async createFiles() {
        let exists = await SetFiles.fileExists()
        if (!exists) {
            await fs.promises.mkdir(`${dataEXT}\\${projectName}\\`, { recursive: true })
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\tokens.txt`, "", function (err) {});
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\proxies.txt`, "", function (err) {});

            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\recentgiveaway.txt`, "", function (err) {});
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\bios.txt`, "", function (err) {});
            await fs.promises.mkdir(`${dataEXT}\\${projectName}\\pfps`, "", function (err) {});

            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\CMV2.csv`, "", function (err) {console.log(err)});
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\MESniper.csv`, "", function (err) {});
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\CMTracker.csv`, "", function (err) {});
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\SolTransfer.csv`, "", function (err) {});
            return true
        } else {
            return true
        }
    }

    static async fileExists() {
        let fileExists = fs.existsSync(`${dataEXT}\\${projectName}\\proxies.txt`)
        return fileExists
    }

}


module.exports = SetFiles;