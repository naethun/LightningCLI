const anchor = require("@project-serum/anchor");
const web3 = require('@solana/web3.js');

const Log = require("../../log");
const { setTitle, createTitle } = require("../../../pages/utils/title");
const { projectName, projectVersion } = require("../../../versionData");
const timeout = require("../../../pages/utils/timeout");

let PUBLIC_KEY = new web3.PublicKey("4gnU5VUQJqVWTduZLZHgvs1axmFS9Ayn9SweuStk354q"); //public key of address here
const CONNECTION = new web3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
    'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
);

class CMTracker {
    constructor (data,total,tasks){
        this.CMID = data.cmid
        
        this.RUNNING = tasks;
        this.TOTAL = total
        this.LOGS = [];
    }

    
    updateTitle(running) {
        setTitle(
            createTitle([
                projectName,
                `v${projectVersion}`,
                `Candy Machine Stats Tracker`
            ]))
    }

    async logIt(data) {
        timeout(this.delay)
        let type = this.success == false ? "error" : "info"
        await this.LOGGER.handle(type, `[CMID-${this.RUNNING}] - ${data}`, true, false)
        this.LOGS.push({
            type: type,
            info: `[TASK-${this.RUNNING}] - ${data}`
        })
        return
    }

    async getCandyMachineState (anchorWallet, candyMachineId, connection){
        const provider = new anchor.Provider(connection, anchorWallet, {
            preflightCommitment: 'recent',
        });
    
        const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
    
        const program = new anchor.Program(idl, CANDY_MACHINE_PROGRAM, provider);
    
        const state = await program.account.candyMachine.fetch(candyMachineId);
        const itemsAvailable = state.data.itemsAvailable.toNumber();
        const itemsRedeemed = state.itemsRedeemed.toNumber();
        const itemsRemaining = itemsAvailable - itemsRedeemed;
    
        const presale =
            state.data.whitelistMintSettings &&
            state.data.whitelistMintSettings.presale &&
            (!state.data.goLiveDate || state.data.goLiveDate.toNumber() > new Date().getTime() / 1000);
    
        return {
            id: candyMachineId,
            program,
            state: {
                itemsAvailable,
                itemsRedeemed,
                itemsRemaining,
                isSoldOut: itemsRemaining === 0,
                isActive: (presale || state.data.goLiveDate.toNumber() < new Date().getTime() / 1000) &&
                (state.data.endSettings 
                    ? state.data.endSettings.endSettingType.date
                    ? state.data.endSettings.number.toNumber() > new Date().getTime() / 1000
                    : itemsRedeemed < state.data.endSettings.number.toNumber()
                : true),
                isPresale: presale,
                goLiveDate: state.data.goLiveDate,
                treasury: state.wallet,
                tokenMint: state.tokenMint,
                gatekeeper: state.data.gatekeeper,
                endSettings: state.data.endSettings,
                whitelistMintSettings: state.data.whitelistMintSettings,
                hiddenSettings: state.data.hiddenSettings,
                price: state.data.price,
            },
        };
    };
    
    async getStatsOnCM () {
        this.LOGGER = new Log()
        this.LOGGER.create("Candy Machine Stats Tracker", false)

        this.updateTitle(this.TOTAL, this.GOOD, this.BAD)

        const candyMachineId = new anchor.web3.PublicKey(this.CMID);
    
        const cndy = await this.getCandyMachineState(
            PUBLIC_KEY,
            candyMachineId,
            CONNECTION,
        );

        var localTime = new Date(1640995200*1000);

        this.logIt(`NFTs Available: ${cndy.state.itemsAvailable}`)
        this.logIt(`NFTs Redeemed: ${cndy.state.itemsRedeemed}`)
        this.logIt(`NFTs Remaining: ${cndy.state.itemsRemaining}`)
        this.logIt(`Mint Price: ${cndy.state.price * 0.000000001} SOL`)
        this.logIt(`Mint Date: ${localTime.toLocaleString()} (Local time)`)

    
    }
}

module.exports = CMTracker