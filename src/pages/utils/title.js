class Title {
    static createTitle(params) {
        let title = ""
        for (let i = 0; i < params.length; i++) {
            i == params.length - 1 ? title += params[i] : title += params[i] + " | "; 
        }
        return title
    }

    static setTitle(title) {
        process.stdout.write(
            String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
        )
    }
}


module.exports = Title;