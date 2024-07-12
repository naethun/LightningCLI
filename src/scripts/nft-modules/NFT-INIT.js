const CSVReader = require("./utils/csvparser")
let csv = new CSVReader();

const ModuleRunner = require ("./utils/moduleRunner")
ModuleRunner.init();

const { projectName } = require("../../versionData");
const { dataEXT } = require("../../pages/utils/extraData");

class NFTInit {
    constructor () {
        this.config = 
        {
            //modules
            "meSniper":["secret_key","collection_name","delay_requests","wish_price"],
            "cmv2":["cmid","rpc","private_key"],
    
            //features
            "cmTracker":["cmid"],
            "balanceCheck":["private_key"],
            "solTransfer":["private_key", "receiver", "amount"]
        }
    
        this.MESniper = false;
        this.CMV2Mint = false;
        
        this.CMTracker = false;
        this.solTransfer = false;
        this.walletGen = false;
    }
    
    modules(csvPath, modulePath, config_map){
        csv.read(csvPath).then(async (presaved_tasks) => {
            for (var i = 0; i < presaved_tasks.length; i++) {
                let keys = Object.keys(presaved_tasks[i]);
    
                let data = {};
                let tasks = i + 1
                let total = presaved_tasks.length
                
                let good = 0
                let bad = 0

                for (var key in config_map) {
                    data[config_map[key]] = presaved_tasks[i][keys[key]];
                }
                
                let instance = await ModuleRunner.instantiate(modulePath, data, tasks, total, good, bad);
    
                if (this.MESniper === true){
                    instance.SnipeInit();
                } else if (this.CMV2Mint === true){
                    instance.MintInit();
                }  else if (this.CMTracker === true){
                    instance.getStatsOnCM();
                }  else if (this.solTransfer === true){
                    instance.transfer();
                }   else if (this.walletGen === true){
                    instance.ethWalletGen();
                    instance.solWalletGen();
                }
            }
        })
    }
    
    async runModules(){
        try{
            if (this.CMV2Mint === true) {
                this.modules(`./src/scripts/nft-modules/cmv2/mint.csv`, "cmv2/mint.js", this.config.cmv2)
            } else if (this.MESniper === true) {
                this.modules("./src/scripts/nft-modules/sniper/sniper.csv", "sniper/meSniper.js", this.config.meSniper)
            } else if (this.CMV2Mint === true) {
                this.modules("./src/scripts/nft-modules/cmv2/mint.csv", "cmv2/mint.js", this.config.cmv2)
            } else if (this.CMTracker === true){
                this.modules("./src/scripts/nft-modules/features/csv/CMTracker.csv", "features/CMTracker.js", this.config.cmTracker)
            } else if (this.solTransfer === true) {
                this.modules("./src/scripts/nft-modules/features/csv/solTransfer.csv", "features/solTransfer.js", this.config.solTransfer)
            } else if (this.walletGen === true) {
                this.modules("./src/scripts/nft-modules/features/csv/solTransfer.csv" , "features/walletGen.js")
            }
        } catch (e) {
            console.log(e)
        }
    } 
}

module.exports = NFTInit