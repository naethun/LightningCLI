const GiveawayReact = require("./giveaways/giveawayreactrefactored");
const GiveawayButton = require("./giveaways/giveawaybuttonrefactored");
const {
    getTokens
} = require("../utils/handleTokens.js");
const arrayChunks = require('array-splitter-chunks'); //sub array
const Log = require("../log");
const inquirer = require("@jokzyz/inquirer");
const fs = require('fs');
const {
    dataEXT
} = require("../../pages/utils/extraData");
const {
    Blue,
    Reset
} = require("../../pages/utils/colors");
const {
    setTitle,
    createTitle
} = require("../../pages/utils/title");
const {
    projectName,
    projectVersion
} = require("../../versionData");
class GiveawayDriver {
    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Giveaway Joiner | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }
    async giveaway() {
        let invite = await inquirer.prompt([{
                name: "Giveaway",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "Giveaway URL:",
                type: "input",
            }, ])
            .then(async function (answer) {
                return answer.Giveaway
            })
        return invite
    }
    async amount() {
        let amount = await inquirer.prompt([{
                name: "amount",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "# of Accounts to Join Giveaway:",
                type: "input",
            }, ])
            .then(async function (answer) {
                return answer.amount
            })
        return amount
    }
    async init(joinerType, tasks) {
        let link 
        let amount
        let delay
        let threads
        let tokens
        let num
        let chunkSize
        let logs
        let good
        let bad
        let running
        switch (joinerType) {
            case "react":
                this.logger = new Log()
                this.logger.create("GIVEAWAY-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR                  
                link = await this.giveaway(); //discord invite
                amount = await this.amount();
                delay = 50; // delay
                threads = 1; // amount of threads
                tokens = await getTokens()
                num = Math.floor(tokens.length / threads)
                chunkSize = num;
                logs = []
                good = 0;
                bad = 0;
                running = Math.floor(amount - good)
                this.updateTitle(running, good, bad)
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                        if(good == amount){
                        }else{
                        let taskInfo = await new GiveawayReact(i + 1, link, delay, chunk[i]).init()
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running = Math.floor(amount - good)
                        this.updateTitle(running, good, bad)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                    }
                }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                await this.logger.handle("info", `Giveaway Joining Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                try{
                await fs.promises.writeFile(`${dataEXT}\\${projectName}\\recentgiveaway.txt`, link, function (err) {});
                }catch{
                    await this.logger.handle("error",'failed to save link to appData!')    
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        break;
        case "button":
            this.logger = new Log()
                this.logger.create("GIVEAWAY-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR                  
                link = await this.giveaway(); //discord invite
                amount = await this.amount();
                delay = 50; // delay
                threads = 1; // amount of threads
                tokens = await getTokens()
                num = Math.floor(tokens.length / threads)
                chunkSize = num;
                logs = []
                good = 0;
                bad = 0;
                running = Math.floor(amount - good)
                this.updateTitle(running, good, bad)
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                        if(good == amount){
                        }else{
                        let taskInfo = await new GiveawayButton(i + 1, link, delay, chunk[i]).init()
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running = Math.floor(amount - good)
                        this.updateTitle(running, good, bad)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                    }
                }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                await this.logger.handle("info", `Giveaway Joining Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                try{
                await fs.promises.writeFile(`${dataEXT}\\${projectName}\\recentgiveaway.txt`, link, function (err) {});
                }catch{
                    await this.logger.handle("error",'failed to save link to appData!')    
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        }
    }
}

module.exports = GiveawayDriver;