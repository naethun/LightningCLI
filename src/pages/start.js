const { stdout } = require('process');
const { projectLogo, projectName, projectVersion } = require('../versionData.js');
const alternateColor = require('./utils/alternateColor.js');
const center = require('./utils/center.js');
const { Bright, Reset, Blink, Blue } = require('./utils/colors.js');
const { logoWidth } = require('./utils/extraData.js');
const showInfo = require('./utils/showInfo.js');
const typer = require('./utils/typeOut.js');
class Start {

    static produceLogo() {
        let lines = projectLogo.split("\n")
        console.log("\n\n")
        for (let i = 0; i < lines.length; i++) {
            let centered = center(lines[i], 6)
            alternateColor(centered)
        }
    }

    static showPage() {
        return new Promise((resolve, reject) => {
            this.produceLogo()
            let left = Math.floor((process.stdout.columns - logoWidth) / 6) + logoWidth
            stdout.write('\x1B[' + 13 + ';' + left + 'H')
            typer(`${Bright}${Blue}${projectName} v${projectVersion}${Reset}`, 20)
            setTimeout(() => {
                showInfo("Loading...")
            }, 1500);
            setTimeout(() => {
                stdout.write('\x1B[' + process.stdout.rows + ';' + process.stdout.columns + 'H')
                resolve()
            }, 2500);                
        })
    }
}

module.exports = Start;
