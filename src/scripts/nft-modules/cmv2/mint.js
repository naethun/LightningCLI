const web3 = require ('@solana/web3.js');
const anchor = require ('@project-serum/anchor');
const { base58_to_binary } = require ('base58-js');

const {mintOneToken, getCandyMachineState, awaitTransactionSignatureConfirmation} = require ("./tsCompiled/candy-machine.js")
const {NodeWallet} = require("./tsCompiled/nodewallet.js");

const Log = require("../../log");
const { setTitle, createTitle } = require("../../../pages/utils/title");
const { projectName, projectVersion } = require("../../../versionData");
const timeout = require("../../../pages/utils/timeout");
const {Bright, Red} = require('../../../pages/utils/colors.js')

class CMV2mint { 
    constructor(data, tasks, total, good, bad){
        this.CMID = data.cmid;
        this.RPC = data.rpc;
        this.PRIVATE_KEY = data.private_key;
        
        this.LOGS = [];
        this.GOOD = good;
        this.BAD = bad;

        this.success = true;
        this.TOTAL = total
        this.RUNNING = tasks;
    }

    updateTitle(running, good, bad) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Candy Machine V2 Mint | Running - ${running} | Successful - ${good} | Failed - ${bad}`
            ]))
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.LOGGER.handle(type, `[TASK-${this.RUNNING}] - ${data}`, true, false)
        this.LOGS.push({
            type: type,
            info: `[MINTER-${this.RUNNING}] - ${data}`
        })
        return
    }
    
    async MintInit() {
        try {
            this.success = true;
            this.LOGGER = new Log()

            this.LOGGER.create("Candy Machine V2 Mint", false)

            this.updateTitle(this.TOTAL, this.GOOD, this.BAD)

            this.mint(this.RPC, this.CMID, this.PRIVATE_KEY);
        } catch (e) {
            await this.logIt(e)
        }
    }
    
    async mint(rpc, cmid, pkey) {
        try{
            function createConnection(RPC) {
                return new web3.Connection(RPC, 'confirmed');
            }
            const SOLANA_CLIENT = createConnection(rpc);
            await this.logIt(`Connected to Solana Mainnet.`)
        
        
            const wallet = NodeWallet.local(base58_to_binary(pkey));
            await this.logIt(`Derived public address from private key.`)
        
            await this.logIt(`Grabbing info from CMID ${cmid}.`);
            const candyMachineId = new anchor.web3.PublicKey(cmid);
            const cndy = await getCandyMachineState(
                wallet,
                candyMachineId,
                SOLANA_CLIENT,
                await this.logIt(`Info grabbed. Initializing the mint.`)
            );
        
            const txid = (
                await mintOneToken(
                    cndy, 
                    wallet.publicKey, 
                    await this.logIt(`Minting...`)
                )
            ) [0];
    
            if(!txid) {
                this.success = false;
                await this.logIt(`Failed transaction. Retrying..`)
                this.BAD++
                setTimeout(this.MintInit.bind(this), 1500)
            } else if(txid){
                try { 
                    const txTimeoutInMilliseconds = 30000;

                    let statuses = await awaitTransactionSignatureConfirmation(
                        txid,
                        txTimeoutInMilliseconds,
                        SOLANA_CLIENT,
                        true,
                    );

                    this.logIt(statuses);
                } catch (e) {
                    let status = JSON.stringify(e)

                    if(status === '{"InstructionError":[4,{"Custom":6008}]}'){
                        this.success = false;
                        this.logIt("Insufficient funds in your Solana Wallet!")
                        this.BAD++
                        setTimeout(this.MintInit.bind(this), 1500)
                    } else if (status = "{}") {
                        this.logIt(`${Bright}Successfully minted!`)
                        this.GOOD++
                    } else {
                        this.success = false;
                        this.logIt("Minting failed, retrying...")
                        this.BAD++
                        setTimeout(this.MintInit.bind(this), 1500)
                    }
                }
            }
        } catch (e) {
            this.success = false;
            await this.logIt(e, "Retrying...")
            this.BAD++
            setTimeout(this.MintInit.bind(this), 1500)
        }
    }
}

module.exports = CMV2mint