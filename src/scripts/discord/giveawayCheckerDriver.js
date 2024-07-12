const GiveawayChecker = require("./giveaways/checkerrefactored");
const {
    getTokens
} = require("../utils/handleTokens.js");
const arrayChunks = require('array-splitter-chunks'); //sub array
const BrowserView = require("./utils/browserview.js");
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
class GiveawayCheckerDriver {
    updateTitle(running, wins, lost, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Giveaway Checker | Running - ${running} | Winners - ${wins} | Non Winners - ${lost} | Failed - ${bad}`
            ]))
    }
    async link() {
        let invite = await inquirer.prompt([{
            name: "links",
            prefix: `${" ".repeat(7)}${Blue}`,
            message: "Would you like to check the last giveaway you entered?",
            type: "list",
            choices: ['Yes','No']
            }, ])
            .then(async function (answer) {
                if(answer.links == 'No'){
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
                }else{
                    let link = await fs.promises.readFile(`${dataEXT}\\${projectName}\\recentgiveaway.txt`)
                    .then(function(result,link) {
                        link = result
                        return link.toString()
                    })
                    return link
                }
            })
        return invite
    }
    async init(joinerType, tasks) {
        switch (joinerType) {
            case "checker":
                this.logger = new Log()
                this.logger.create("GIVEAWAY-CHECKER-DRIVER")
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR                  
                let link = await this.link(); //discord invite
                let delay = 50; // delay
                let threads = 1; // amount of threads
                let tokens = await getTokens()
                let num = Math.floor(tokens.length / threads)
                let winss = []
                let userwin = []
                const chunkSize = num;
                let logs = []
                let successful
                let good = 0;
                let bad = 0;
                let wins = 0;
                let lost = 0;
                let running = tokens.length
                this.updateTitle(running, wins, lost, bad)
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                        let taskInfo = await new GiveawayChecker(i + 1, link, delay, chunk[i]).init()
                        if(taskInfo.winner){
                        winss.push(taskInfo.token)
                        userwin.push(taskInfo.username)
                        wins++
                        }else{
                            lost++
                        }
                        if(taskInfo.success){
                            good++
                        }else{
                            bad++
                        }
                        running--
                        this.updateTitle(running, wins, lost, bad)
                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                if(wins.length == 0 ){

                }else{
                await inquirer.prompt([{
                    name: "open",
                    prefix: `${" ".repeat(7)}${Blue}`,
                    message: "Would you like to open all winning accounts in a browser?",
                    type: "list",
                    choices: ['Yes','No']
                    }, ])
                    .then(async function (answer) {
                        if(answer.open == 'Yes'){
                            for (let i = 0; i < winss.length; i++) {
                                const token = winss[i];
                                await this.logger.handle("info", `Opening winners browsers`, true, true)
                               new BrowserView(token,link).init()
                                
                            }
                        }
                    })
                }
            
                await this.logger.handle("info", `Giveaway Checker Complete! [Winners: ${wins}] [Non Winners: ${lost}] [Failed: ${bad}]`, true, true)
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        }
    }
    }

module.exports = GiveawayCheckerDriver;