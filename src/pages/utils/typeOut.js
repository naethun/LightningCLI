const { stdout } = require("process");

function typer(string, msPW) {
    if (string.length > 0) {
        stdout.write(string[0])
        setTimeout(
            () => typer(string.substring(1), msPW)
            , msPW);    
    }
}

module.exports = typer;