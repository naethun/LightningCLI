var ethers = require('ethers');
var crypto = require('crypto');
const web3 =  require('@solana/web3.js');
const bs58 = require('bs58');

const Log = require("../../log");
const { setTitle, createTitle } = require("../../../pages/utils/title");
const { projectName, projectVersion } = require("../../../versionData");
const timeout = require("../../../pages/utils/timeout");

class WalletGens {
    constructor(tasks, total){
        this.TOTAL = total
        this.LOGS = [];
    }

    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Wallet generator | Running - ${running}`
            ]))
    }

    async logIt(data) {
        this.LOGGER = new Log()
        this.LOGGER.create("Wallet generator", false)

        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.LOGGER.handle(type, `[TASK] ${data}`, true, false)
        this.LOGS.push({
            type: type,
            info: `\t[INFO - ${data}]`
        })
        return
    }

    ethWalletGen(){
        var id = crypto.randomBytes(32).toString('hex');
        var privateKey = "0x"+id;
        this.logIt(`ETH Private key: ${privateKey}`);
        
        var wallet = new ethers.Wallet(privateKey);
        this.logIt(`ETH Public address: ${wallet.address}`);
    }

    solWalletGen () {
        const keyPair = web3.Keypair.generate();
    
        this.logIt(`SOL Private key: ${bs58.encode(keyPair.secretKey)}`)
        this.logIt(`SOL Public address: ${keyPair.publicKey.toBase58()}`)
    }
}

module.exports = WalletGens