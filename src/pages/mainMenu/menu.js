const { projectBanner } = require("../../versionData")
const alternateColor = require("../utils/alternateColor")
const center = require("../utils/center")
const { Blue, Reset } = require("../utils/colors")
const inquirer = require("@jokzyz/inquirer");
const clearTerminal = require("../utils/clearTerminal");

class Menu {

    async produceLogo() {
        clearTerminal()
        let lines = projectBanner.split("\n")
        console.log("\n\n")
        for (let i = 0; i < lines.length; i++) {
            let centered = center(lines[i], 2)
            alternateColor(centered)
        }
    }

    async prompt() {
        console.log(`\n        ${Blue}${"-".repeat(Math.floor(process.stdout.columns)-16)}${Reset}        \n\n`)
        let menuChoice = await inquirer.prompt({
            prefix: `${" ".repeat(7)}${Blue}`,
            name: "Decision",
            type: "list",
            message: "Please choose an option!\n",
            choices: ["\tDiscord Modules", "\tNFT Modules", "\tOptions", "\tExit"],
        })
        let decision = menuChoice.Decision.replace(/\t/g, "")
        return decision
    }
    
    async showPage() {
        await this.produceLogo()
        setTimeout(() => {
            return             
        }, 1000);
    }

}

module.exports = Menu