const {
    projectName
} = require("../../versionData");
const {
    dataEXT
} = require("../utils/extraData");
const fs = require('fs');

class HandleKey {

    static async saveKey(key) {
        let exists = HandleKey.fileExists()
        if (!exists) {
            await fs.promises.mkdir(`${dataEXT}\\${projectName}\\`, { recursive: true })
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\key.txt`, key, function (err) {});
            return true
        } else {
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\key.txt`, key, function (err) {});
            return true
        }
    }

    static async fileExists() {
        let fileExists = fs.existsSync(`${dataEXT}\\${projectName}\\key.txt`)
        return fileExists
    }

    static async keyEmpty() {
        let keyEmpty = await HandleKey.getKey() == ""
        return keyEmpty
    }

    static async getKey() {
        let key = fs.readFileSync(`${dataEXT}\\${projectName}\\key.txt`, "utf-8")
        return key
    }

}


module.exports = HandleKey;