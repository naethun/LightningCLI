const {
    projectName
} = require("../../versionData");
const fs = require('fs');
const {
    dataEXT
} = require("../../pages/utils/extraData");

class HandleTokens {

    static async saveTokens(tokenList) {
        let exists = HandleTokens.fileExists()
        let tokenString = ""
        
        tokenList.forEach(function (token, index) {
            tokenString += `${token}`
            if (index + 1 < tokenList.length) {
                tokenString += `\n`
            }
        });
        if (!exists) {
            await fs.promises.mkdir(`${dataEXT}\\${projectName}\\`, { recursive: true })
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\tokens.txt`, tokenString, function (err) {});
            return true
        } else {
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\tokens.txt`, tokenString, function (err) {});
            return true
        }
    }

    static async fileExists() {
        let fileExists = fs.existsSync(`${dataEXT}\\${projectName}\\tokens.txt`)
        return fileExists
    }

    static async tokensEmpty() {
        let keyEmpty = await HandleTokens.getTokens().length == 0;
        return keyEmpty
    }

    static async getTokens() {
        let tokens = fs.readFileSync(`${dataEXT}\\${projectName}\\tokens.txt`, "utf-8")
        return tokens.split("\n").join(" ").replace(/\r/g, "").split(" ")
    }

}



module.exports = HandleTokens;