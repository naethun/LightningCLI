const web3 = require('@solana/web3.js');
const bs58 = require ('bs58');

const Log = require("../../log");
const { setTitle, createTitle } = require("../../../pages/utils/title");
const { projectName, projectVersion } = require("../../../versionData");
const timeout = require("../../../pages/utils/timeout");

class SolTransfer {
    constructor(data, tasks, total){
        this.RPC =  "https://api.mainnet-beta.solana.com"
        this.PRIVATE_KEY = data.private_key //private key
        this.RECEIVER = data.receiver //public address
        this.SEND = data.amount //requested price

        this.RUNNING = tasks;
        this.TOTAL = total
        this.LOGS = [];
    }

    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Solana Transfer | Running - ${running}`
            ]))
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.LOGGER.handle(type, `[TASK-${this.RUNNING}] - ${data}`, true, false)
        this.LOGS.push({
            type: type,
            info: `[INFO-${this.RUNNING}] - ${data}`
        })
        return
    }

    async transfer () {
        this.LOGGER = new Log()
        this.LOGGER.create("Solana Transfer", false)

        const connection =  new web3.Connection(this.RPC);
    
        const keypair = web3.Keypair.fromSecretKey(bs58.decode(this.PRIVATE_KEY));
        
        const receiver = new web3.PublicKey(this.RECEIVER);
    
        const solTransferAmount = web3.LAMPORTS_PER_SOL * this.SEND

        this.logIt(`Sending ${this.SEND}, please be patient. It may take some time depending on SOL network.`)

        try {
            var transaction = new web3.Transaction().add(
                web3.SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: receiver,
                    lamports: solTransferAmount,
                })
              );
          
              var signature = await web3.sendAndConfirmTransaction(
                  connection,
                  transaction,
                  [keypair],
                  {
                    commitment:'recent',
                    skipPreflight: true
          
                  },
              );
              this.logIt("Successfully sent!");
        } catch (e) {
            if(e.message.includes('({"err":{"InstructionError":[0,{"Custom":1}]}}')){
                this.logIt("You do not have the SOL needed to complete the transfer.")
            } else if (e.message.includes('seconds')) {
                this.logIt("The SOL network took too long to complete the transaction. Retrying...")
                this.transfer.bind(this)
            }
        }
    }
}

module.exports = SolTransfer