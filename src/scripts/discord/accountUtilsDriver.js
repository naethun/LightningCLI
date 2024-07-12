const Hypesquad = require("./DiscordTools/hypesquad");
const BioChange = require("./DiscordTools/setbio");
const PFPChange = require("./DiscordTools/setpfp");
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
const { token } = require("@project-serum/anchor/dist/cjs/utils");
class HypeDriver {
    updateTitle(type,running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `${type} | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }
    async init(joinerType, tasks) {
        switch (joinerType) {
            case "hype":
                this.logger = new Log()
                this.logger.create("HYPE-JOINER")
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
                this.updateTitle(running, good, bad)
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                        let taskInfo = await new Hypesquad(i + 1, delay, chunk[i]).init()
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running--
                        this.updateTitle('Hypesquad Joiner',running, good, bad)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                await this.logger.handle("info", `Joining Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)

                break

                case "bio":{
                    this.logger = new Log()
                    this.logger.create("BIO-DRIVER")
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
                    this.updateTitle(running, good, bad)
                    // ADD THREADING
                    // ADD THREADING
                    // ADD THREADING
                    // ADD THREADING
                    for (let i = 0; i < tokens.length; i += chunkSize) {
                        const chunk = tokens.slice(i, i + chunkSize);
                        for (let i = 0; i < chunk.length; i++) {
                            let taskInfo = await new BioChange(i + 1, delay, chunk[i]).init()
                            let successful = taskInfo.success;
                            successful ? good++ : bad++
                            running--
                            this.updateTitle('Set Bios',running, good, bad)
                            let logData = taskInfo.logs;
                            logData.forEach(log => {
                                logs.push(log)
                            });
                    }
                    }
    
                    // MOVE OUT
                    // MOVE OUT
                    // MOVE OUT
                    await this.logger.handle("info", `Bio Changing Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                    await this.logger.handle("info", `Saving task logs...`, true, true)
                    for (let i = 0; i < logs.length; i++) {
                        await this.logger.handle(logs[i].type, logs[i].info, false, true)
                    }
                    await this.logger.handle("info", `Task logs saved!`, true, true)
                
            }
            break

                case "PFP":{
                    this.logger = new Log()
                    this.logger.create("PFP-DRIVER")
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
                    this.updateTitle(running, good, bad)
                    // ADD THREADING
                    // ADD THREADING
                    // ADD THREADING
                    // ADD THREADING
                    for (let i = 0; i < tokens.length; i += chunkSize) {
                        const chunk = tokens.slice(i, i + chunkSize);
                        for (let i = 0; i < chunk.length; i++) {
                            let taskInfo = await new PFPChange(i + 1, delay, chunk[i]).init()
                            let successful = taskInfo.success;
                            successful ? good++ : bad++
                            running--
                            this.updateTitle('Set Profile pcitures',running, good, bad)
                            let logData = taskInfo.logs;
                            logData.forEach(log => {
                                logs.push(log)
                            });
                    }
                    }
    
                    // MOVE OUT
                    // MOVE OUT
                    // MOVE OUT
                    await this.logger.handle("info", `Profile Picture Changing Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                    await this.logger.handle("info", `Saving task logs...`, true, true)
                    for (let i = 0; i < logs.length; i++) {
                        await this.logger.handle(logs[i].type, logs[i].info, false, true)
                    }
                    await this.logger.handle("info", `Task logs saved!`, true, true)

        }
    }
    }
}

module.exports = HypeDriver;