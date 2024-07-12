function center(string, denom) {
    cliWidth = process.stdout.columns
    if (string.length < cliWidth) {
        extraSpace = cliWidth-string.length
        left = Math.floor(extraSpace/denom)
        right = extraSpace-left
        string = " ".repeat(left) + string + " ".repeat(right)
    }
    return string
}

module.exports = center;