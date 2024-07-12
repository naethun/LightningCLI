const {
    projectName
} = require("../../versionData");
const fs = require('fs');
const {
    dataEXT
} = require("../../pages/utils/extraData");

class HandleProxies {

    static async saveProxies(proxyList) {
        let exists = HandleProxies.fileExists()
        let proxiesString = ""
        
        proxyList.forEach(function (proxy, index) {
            proxiesString += `${proxy}`
            if (index + 1 < proxyList.length) {
                proxiesString += `\n`
            }
        });
        if (!exists) {
            await fs.promises.mkdir(`${dataEXT}\\${projectName}\\`, { recursive: true })
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\proxies.txt`, proxiesString, function (err) {});
            return true
        } else {
            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\proxies.txt`, proxiesString, function (err) {});
            return true
        }
    }

    static async fileExists() {
        let fileExists = fs.existsSync(`${dataEXT}\\${projectName}\\proxies.txt`)
        return fileExists
    }

    static async proxiesEmpty() {
        let proxiesEmpty = await HandleProxies.getProxies().length == 0;
        return proxiesEmpty
    }

    static async getProxies() {
        let proxies = fs.readFileSync(`${dataEXT}\\${projectName}\\proxies.txt`, "utf-8")
        return proxies.split("\n").join(" ").replace(/\r/g, "").split(" ")
    }

    static async getRandomProxy() {
        let proxies = await HandleProxies.getProxies()
        return proxies[Math.floor(Math.random()*proxies.length)];
    }

}



module.exports = HandleProxies;