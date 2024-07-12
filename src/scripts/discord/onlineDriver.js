const Connection = require("./DiscordTools/onlineTokens");
const {
    getTokens
} = require("../utils/handleTokens.js");
const arrayChunks = require('array-splitter-chunks'); //sub array
const Log = require("../log");
const {
    setTitle,
    createTitle
} = require("../../pages/utils/title");
const {
    projectName,
    projectVersion
} = require("../../versionData");
class OnlineDriver {
    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Online Tokens | Offline - ${running} | Online - ${good}`
            ]))
    }
    async init(joinerType, tasks) {
        switch (joinerType) {
            case "Online":
                this.logger = new Log()
                this.logger.create("ONLINE-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR                  
                let delay = 50; // delay
                let threads = 1; // amount of threads
                let tokens = await getTokens()
                let num = Math.floor(tokens.length / threads)
                const chunkSize = num;
                let logs = []
                let good = 0;
                let bad = 0;
                let running = tokens.length
                this.updateTitle(running, good)
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                     
                        let taskInfo = await new Connection(i + 1,delay, chunk[i]).init()
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running--
                        this.updateTitle(running, good)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
        }
    }
}

module.exports = OnlineDriver;