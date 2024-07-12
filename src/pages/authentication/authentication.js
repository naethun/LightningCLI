const {
    projectName
} = require("../../versionData");
const {
    operatingSystem,
    dataEXT,
    logoWidth
} = require("../utils/extraData");
const {
    SAVED_KEY_INVALID,
    SAVED_KEY_VALID,
    NO_SAVED_KEY,
    ERROR,
    KEY_VALID,
    KEY_INVALID
} = require("../utils/keyCodes");
const fs = require('fs');
const {
    stdout
} = require("process");
require('dotenv').config();
const inquirer = require("@jokzyz/inquirer");
const HandleKey = require("./handleKey");
const ValidateKey = require("./validateKey");
const timeout = require("../utils/timeout");
const showInfo = require("../utils/showInfo");
const { fileExists, keyEmpty, getKey } = require("./handleKey");
const validateKey = require("./validateKey");

class Authenticator {

    async checkForSaved() {
        try {
            if (await fileExists() == true && await keyEmpty() == false) {
                showInfo("Logging in...")
                let key = await getKey()
                let keyValid = validateKey(key)
                if (keyValid) {
                    return {
                        info: SAVED_KEY_VALID,
                        key: key
                    }
                } else {
                    return {
                        info: SAVED_KEY_INVALID
                    }
                }
            } else {
                return {
                    info: NO_SAVED_KEY
                }
            }
        } catch (error) {
            console.log(error)
            return {
                info: ERROR,
                error: error
            }
        }
    }

    async getNewKey() {

        let left = Math.floor((process.stdout.columns - logoWidth) / 6) + logoWidth
        stdout.write('\x1B[' + 16 + ';' + left + 'H')

        let key = await inquirer.prompt({
            prefix: "",
            name: "Key",
            type: "inputKey",
            message: " ",
        })

        if (ValidateKey(key.Key)) {
            return {
                valid: true,
                key: key.Key
            }
        } else {
            return {
                valid: false
            }
        }

    }

    async prompt() {
        await timeout(1000)
        showInfo("Enter Key:")
        await timeout(1000)
        let keyData = await this.getNewKey()
        if (keyData.valid == true) {
            HandleKey.saveKey(keyData.key)
            return keyData
        } else {
            return await this.prompt()
        }

    }

    async authenticate() {

        let checkKey = await this.checkForSaved()
        switch (checkKey.info) {
            case SAVED_KEY_VALID:
                let key = checkKey.key
                return {
                    valid: true,
                    key: key
                }
            case SAVED_KEY_INVALID:
                let saveInvalData = await this.prompt()
                return saveInvalData
            case NO_SAVED_KEY:
                let noSaveData = await this.prompt()
                console.log(noSaveData)
                return noSaveData
            case ERROR:
                console.log("ERROR")
                break
        }
    }

}

module.exports = Authenticator