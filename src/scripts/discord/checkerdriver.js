const Checker = require("./DiscordTools/discordchecker.js");
const inquirer = require("@jokzyz/inquirer");
const fs = require('fs');
const {
    dataEXT
} = require("../../pages/utils/extraData");
const {
    getTokens
} = require("../utils/handleTokens.js");
const arrayChunks = require('array-splitter-chunks'); //sub array
const { Blue, Reset } = require("../../pages/utils/colors");
const Log = require("../log");
const {
    setTitle,
    createTitle
} = require("../../pages/utils/title");
const {
    projectName,
    projectVersion
} = require("../../versionData");

class CheckDriver {

    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Account Checker | Running - ${running} | Vaild - ${good} | Locked/Disabled - ${bad}`
            ]))
    }

    async init(joinerType, tasks) {

        switch (joinerType) {
            case "checker":

                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION
                // SEPERATE ALL THIS REUSABLE SHIT INTO TOP LEVEL OF FUNCTION


                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                // MOVE VARS INTO CONSTRUCTOR
                this.logger = new Log()
                this.logger.create("CHECKER-DRIVER")

                let delay = 50; // delay
                let threads = 1; // amount of threads

                let tokens = await getTokens()
                let num = Math.floor(tokens.length / threads)
                const chunkSize = num;
                let logs = []
                let good = 0;
                let bad = 0;
                let vaild = []
                let running = tokens.length

                this.updateTitle(running, good, bad)

                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                // ADD THREADING
                for (let i = 0; i < tokens.length; i += chunkSize) {
                    const chunk = tokens.slice(i, i + chunkSize);
                    for (let i = 0; i < chunk.length; i++) {
                        let taskInfo = await new Checker(i + 1, delay, chunk[i]).init()
                        let status = taskInfo.status;
                        if (status == 'Vaild') {
                            good++
                            vaild.push(chunk[i])
                        }
                        if (status == 'Failed') {
                            good++
                            vaild.push(chunk[i])
                        }
                        if (status == 'Locked') {
                            bad++
                        }
                        if (status == 'Disabled') {
                            bad++
                        }
                        running--

                        this.updateTitle(running, good, bad)

                        let logData = taskInfo.logs;
                        logData.forEach(log => {
                            logs.push(log)
                        });
                    }
                }

                // MOVE OUT
                // MOVE OUT
                // MOVE OUT
                await this.logger.handle("info", `Account Checker Complete! [Successful: ${good}] [Failed: ${bad}]`, true, true)
                await inquirer.prompt([
                        {
                            name: "change",
                            prefix: `${" ".repeat(7)}${Blue}`,
                            message: "Would you like to delete disabled/invaild tokens?",
                            type: "list",
                            choices: ['Yes','No']
                        }
                    ])
                    .then(async function (answer) {
                        if(answer.change == 'Yes'){
                            await fs.promises.writeFile(`${dataEXT}\\${projectName}\\tokens.txt`, ``, function (err) {});
                            for (let i = 0; i < vaild.length; i++) {
                                const token = vaild[i];
                                await fs.promises.appendFile(`${dataEXT}\\${projectName}\\tokens.txt`, `${token}\n`, function (err) {});
                            }
                        }else{
                            return
                        }
                    });
                await this.logger.handle("info", `Saving task logs...`, true, true)
                for (let i = 0; i < logs.length; i++) {
                    await this.logger.handle(logs[i].type, logs[i].info, false, true)
                }
                await this.logger.handle("info", `Task logs saved!`, true, true)
        }

    }

}

module.exports = CheckDriver;