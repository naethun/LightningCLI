const VanillaJoiner = require("./joiners/joinerRefactored");
const {
    getTokens
} = require("../utils/handleTokens.js");
const arrayChunks = require('array-splitter-chunks'); //sub array
const Log = require("../log");
const inquirer = require("@jokzyz/inquirer");
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
class JoinerDriver {
    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Vanilla Joiner | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }
    async invite() {
        let invite = await inquirer.prompt([{
                name: "invite",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "Invite URL:",
                type: "input",
            }, ])
            .then(async function (answer) {
                return answer.invite
            })
        return invite
    }
    async amount() {
        let amount = await inquirer.prompt([{
                name: "amount",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "# of Accounts to Join Server:",
                type: "input",
            }, ])
            .then(async function (answer) {
                return answer.amount
            })
        return amount
    }
    async init(joinerType, tasks) {
        switch (joinerType) {
            case "vanilla":
                this.logger = new Log()
                this.logger.create("JOINER-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR                  
                let invites = await this.invite(); //discord invite
                let amount = await this.amount();
                let delay = 50; // delay
                let threads = 1; // amount of threads
                let apiKey = "14b8bbd820ffc6d1c3f46002691288ef"; //captcha provider token
                let tokens = await getTokens()
                let num = Math.floor(tokens.length / threads)
                const chunkSize = num;
                let logs = []
                let good = 0;
                let bad = 0;
                let running = Math.floor(amount - good)
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
                        let taskInfo = await new VanillaJoiner(i + 1, invites, delay, chunk[i], apiKey).init()
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
                await this.logger.handle("info", `Joining Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        }
    }
}

module.exports = JoinerDriver;