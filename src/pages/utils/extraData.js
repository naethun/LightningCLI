module.exports = {
    logoWidth: 53,
    operatingSystem: process.platform,
    dataEXT: process.platform === "win32" ? process.env.APPDATA : process.platform === "darwin" ? process.env.HOME : null
}