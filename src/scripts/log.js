const {
    Red,
    Reset,
    Blue,
    Yellow
} = require("../pages/utils/colors")
const getTime = require("./utils/getTime")
const fs = require("fs")
const {
    dataEXT
} = require("../pages/utils/extraData")
const {
    projectName
} = require("../versionData")

class Log {

    logFile;

    constructor() {
        this.logFile;
    }

    async create(type, makeFile = true) {
        let time = getTime(true)
        let fileName = `${type} LOGS-${time.replace(/:/g, "_")}`
        this.logFile = fileName
        if (!makeFile) return
        // if (!fs.existsSync(`${dataEXT}\\${projectName}\\logs`)) {
        //     fs.mkdirSync(`${dataEXT}\\${projectName}\\logs\\`, {
        //         recursive: true
        //     })
        // }
        // fs.writeFileSync(`${dataEXT}\\${projectName}\\logs\\${this.logFile}.txt`, "", function (err) {});
        return
    }

    async getLogFile() {
        return this.logFile;
    }

    async addLogToFile(data) {
        let file = await this.getLogFile()
        // fs.appendFileSync(`${dataEXT}\\${projectName}\\logs\\${file}.txt`, data + "\n")
        return
    }

    async logToConsole(type, info, color) {
        console.log(`${Reset}${color}${await getTime(false)} [${type}] ${info}${Reset}`)
        return
    }


    async handle(type, info, toConsole, toFile = true) {
        switch (type) {
            case "FATAL":
            case "fatal":
                if (toFile) await this.addLogToFile(`\n\n${await getTime(true)} [FATAL ERROR] ${info}`)
                if (toConsole) await this.logToConsole("FATAL ERROR", info, Red)
                process.exit(1)
            case "ERROR":
            case "error":
                if (toFile) await this.addLogToFile(`${await getTime(true)} [ERROR] ${info}`)
                if (toConsole) await this.logToConsole("ERROR", info, Red)
                return
            case "WARN":
            case "warn":
                if (toFile) await this.addLogToFile(`${await getTime(true)} [WARN] ${info}`)
                if (toConsole) await this.logToConsole("WARN", info, Yellow)
                return
            case "INFO":
            case "info":
                if (toFile) await this.addLogToFile(`${await getTime(true)} [INFO] ${info}`)
                if (toConsole) await this.logToConsole("INFO", info, Blue)
                return
        }
    }

    async logArray(list) {
        for (let i = 0; i < list.length; i++) {
            this.handle(list[i].type, list[i].info, list[i].toConsole)
        }
    }

}

module.exports = Log;