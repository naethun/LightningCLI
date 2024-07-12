"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createAssociatedTokenAccountInstruction = exports.getNetworkToken = exports.getNetworkExpire = exports.getAtaForMint = exports.CIVIC = exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = exports.formatNumber = exports.toDate = void 0;
var anchor = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var web3_js_2 = require("@solana/web3.js");
var toDate = function (value) {
    if (!value) {
        return;
    }
    return new Date(value.toNumber() * 1000);
};
exports.toDate = toDate;
var numberFormater = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
exports.formatNumber = {
    format: function (val) {
        if (!val) {
            return '--';
        }
        return numberFormater.format(val);
    },
    asNumber: function (val) {
        if (!val) {
            return undefined;
        }
        return val.toNumber() / web3_js_2.LAMPORTS_PER_SOL;
    }
};
exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
exports.CIVIC = new anchor.web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs');
var getAtaForMint = function (mint, buyer) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([buyer.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getAtaForMint = getAtaForMint;
var getNetworkExpire = function (gatekeeperNetwork) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([gatekeeperNetwork.toBuffer(), Buffer.from('expire')], exports.CIVIC)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getNetworkExpire = getNetworkExpire;
var getNetworkToken = function (wallet, gatekeeperNetwork) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([
                    wallet.toBuffer(),
                    Buffer.from('gateway'),
                    Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
                    gatekeeperNetwork.toBuffer(),
                ], exports.CIVIC)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getNetworkToken = getNetworkToken;
function createAssociatedTokenAccountInstruction(associatedTokenAddress, payer, walletAddress, splTokenMintAddress) {
    var keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: spl_token_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false
        },
        {
            pubkey: web3_js_2.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false
        },
    ];
    return new web3_js_2.TransactionInstruction({
        keys: keys,
        programId: exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([])
    });
}
exports.createAssociatedTokenAccountInstruction = createAssociatedTokenAccountInstruction;
