const LeaveGuild = require("./DiscordTools/leavesever");
const LeaveGuilds = require("./DiscordTools/leavesevers");
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
class LeaveDriver {
    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Guild leaver | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }
    async guild() {
        let invite = await inquirer.prompt([{
                name: "guild",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "Guild ID:",
                type: "input",
            }, ])
            .then(async function (answer) {
                return answer.guild
            })
        return invite
    }
    async mode() {
        let mode = await inquirer.prompt([
            {
                name: "change",
                prefix: `${" ".repeat(7)}${Blue}`,
                message: "Would you like to leave all servers or one?",
                type: "list",
                choices: ['\tAll Servers','\tOne']
            }
        ])
        .then(async function (answer) {
            if(answer.change == ''){

            }
            return answer.change
        })
        return mode
    }
    async init(joinerType, tasks) {
        switch (joinerType) {
            case "single":
                this.logger = new Log()
                this.logger.create("LEAVER-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR         
                let mode = await this.mode()
                let guild_id = '986926330677444668'
                if(mode == '\tOne'){         
                guild_id = await this.guild(); //discord invite
                }
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
                        if(mode == '\tOne'){
                        let taskInfo = await new LeaveGuild(i + 1,delay, chunk[i], guild_id).init()
                        
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running--
                        this.updateTitle(running, good, bad)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                    }else{
                        let taskInfo = await new LeaveGuilds(i + 1,delay, chunk[i], guild_id).init()
                        
                        let successful = taskInfo.success;
                        successful ? good++ : bad++
                        running--
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
                await this.logger.handle("info", `Leaving Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        }
    }
}

module.exports = LeaveDriver;