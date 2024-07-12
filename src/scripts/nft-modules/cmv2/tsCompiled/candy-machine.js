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
exports.shortenAddress = exports.mintOneToken = exports.getCandyMachineCreator = exports.getCandyMachineState = exports.awaitTransactionSignatureConfirmation = exports.CANDY_MACHINE_PROGRAM = void 0;
var anchor = require("@project-serum/anchor");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var connection_1 = require("./connection");
var utils_1 = require("./utils");
exports.CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
var TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
var awaitTransactionSignatureConfirmation = function (txid, timeout, connection, queryStatus) {
    if (queryStatus === void 0) { queryStatus = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var done, status, subId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    done = false;
                    status = {
                        slot: 0,
                        confirmations: 0,
                        err: null
                    };
                    subId = 0;
                    return [4 /*yield*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        setTimeout(function () {
                                            if (done) {
                                                return;
                                            }
                                            done = true;
                                            reject({ timeout: true });
                                        }, timeout);
                                        _a.label = 1;
                                    case 1:
                                        if (!(!done && queryStatus)) return [3 /*break*/, 3];
                                        // eslint-disable-next-line no-loop-func
                                        (function () { return __awaiter(void 0, void 0, void 0, function () {
                                            var signatureStatuses, e_1;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, connection.getSignatureStatuses([
                                                                txid,
                                                            ])];
                                                    case 1:
                                                        signatureStatuses = _a.sent();
                                                        status = signatureStatuses && signatureStatuses.value[0];
                                                        if (!done) {
                                                            if (!status) {
                                                            }
                                                            else if (status.err) {
                                                                done = true;
                                                                reject(status.err);
                                                            }
                                                            else if (!status.confirmations) {
                                                            }
                                                            else {
                                                                done = true;
                                                                resolve(status);
                                                            }
                                                        }
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        e_1 = _a.sent();
                                                        if (!done) {
                                                        }
                                                        return [3 /*break*/, 3];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); })();
                                        return [4 /*yield*/, sleep(2000)];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 1];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    status = _a.sent();
                    //@ts-ignore
                    if (connection._signatureSubscriptions[subId]) {
                        connection.removeSignatureListener(subId);
                    }
                    done = true;
                    return [2 /*return*/, status];
            }
        });
    });
};
exports.awaitTransactionSignatureConfirmation = awaitTransactionSignatureConfirmation;
var createAssociatedTokenAccountInstruction = function (associatedTokenAddress, payer, walletAddress, splTokenMintAddress) {
    var keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SystemProgram.programId,
            isSigner: false,
            isWritable: false
        },
        { pubkey: spl_token_1.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false
        },
    ];
    return new anchor.web3.TransactionInstruction({
        keys: keys,
        programId: utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([])
    });
};
var getCandyMachineState = function (anchorWallet, candyMachineId, connection) { return __awaiter(void 0, void 0, void 0, function () {
    var provider, idl, program, state, itemsAvailable, itemsRedeemed, itemsRemaining, presale;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = new anchor.Provider(connection, anchorWallet, {
                    preflightCommitment: 'recent'
                });
                return [4 /*yield*/, anchor.Program.fetchIdl(exports.CANDY_MACHINE_PROGRAM, provider)];
            case 1:
                idl = _a.sent();
                program = new anchor.Program(idl, exports.CANDY_MACHINE_PROGRAM, provider);
                return [4 /*yield*/, program.account.candyMachine.fetch(candyMachineId)];
            case 2:
                state = _a.sent();
                itemsAvailable = state.data.itemsAvailable.toNumber();
                itemsRedeemed = state.itemsRedeemed.toNumber();
                itemsRemaining = itemsAvailable - itemsRedeemed;
                presale = state.data.whitelistMintSettings &&
                    state.data.whitelistMintSettings.presale &&
                    (!state.data.goLiveDate ||
                        state.data.goLiveDate.toNumber() > new Date().getTime() / 1000);
                return [2 /*return*/, {
                        id: candyMachineId,
                        program: program,
                        state: {
                            itemsAvailable: itemsAvailable,
                            itemsRedeemed: itemsRedeemed,
                            itemsRemaining: itemsRemaining,
                            isSoldOut: itemsRemaining === 0,
                            isActive: (presale ||
                                state.data.goLiveDate.toNumber() < new Date().getTime() / 1000) &&
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
                            price: state.data.price
                        }
                    }];
        }
    });
}); };
exports.getCandyMachineState = getCandyMachineState;
var getMasterEdition = function (mint) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([
                    Buffer.from('metadata'),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                    Buffer.from('edition'),
                ], TOKEN_METADATA_PROGRAM_ID)];
            case 1: return [2 /*return*/, (_a.sent())[0]];
        }
    });
}); };
var getMetadata = function (mint) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([
                    Buffer.from('metadata'),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ], TOKEN_METADATA_PROGRAM_ID)];
            case 1: return [2 /*return*/, (_a.sent())[0]];
        }
    });
}); };
var getCandyMachineCreator = function (candyMachine) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([Buffer.from('candy_machine'), candyMachine.toBuffer()], exports.CANDY_MACHINE_PROGRAM)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getCandyMachineCreator = getCandyMachineCreator;
var mintOneToken = function (candyMachine, payer) { return __awaiter(void 0, void 0, void 0, function () {
    var mint, userTokenAccountAddress, userPayingAccountAddress, _a, candyMachineAddress, remainingAccounts, signers, cleanupInstructions, instructions, _b, _c, _d, _e, _f, _g, mint_1, whitelistToken, whitelistBurnAuthority, exists, transferAuthority, metadataAddress, masterEdition, _h, candyMachineCreator, creatorBump, _j, _k, e_2;
    var _l, _m, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                mint = anchor.web3.Keypair.generate();
                return [4 /*yield*/, (0, utils_1.getAtaForMint)(mint.publicKey, payer)];
            case 1:
                userTokenAccountAddress = (_p.sent())[0];
                if (!candyMachine.state.tokenMint) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, utils_1.getAtaForMint)(candyMachine.state.tokenMint, payer)];
            case 2:
                _a = (_p.sent())[0];
                return [3 /*break*/, 4];
            case 3:
                _a = payer;
                _p.label = 4;
            case 4:
                userPayingAccountAddress = _a;
                candyMachineAddress = candyMachine.id;
                remainingAccounts = [];
                signers = [mint];
                cleanupInstructions = [];
                _c = (_b = anchor.web3.SystemProgram).createAccount;
                _l = {
                    fromPubkey: payer,
                    newAccountPubkey: mint.publicKey,
                    space: spl_token_1.MintLayout.span
                };
                return [4 /*yield*/, candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span)];
            case 5:
                instructions = [
                    _c.apply(_b, [(_l.lamports = _p.sent(),
                            _l.programId = spl_token_1.TOKEN_PROGRAM_ID,
                            _l)]),
                    spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, 0, payer, payer),
                    createAssociatedTokenAccountInstruction(userTokenAccountAddress, payer, payer, mint.publicKey),
                    spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccountAddress, payer, [], 1)
                ];
                if (!candyMachine.state.gatekeeper) return [3 /*break*/, 8];
                _e = (_d = remainingAccounts).push;
                _m = {};
                return [4 /*yield*/, (0, utils_1.getNetworkToken)(payer, candyMachine.state.gatekeeper.gatekeeperNetwork)];
            case 6:
                _e.apply(_d, [(_m.pubkey = (_p.sent())[0],
                        _m.isWritable = true,
                        _m.isSigner = false,
                        _m)]);
                if (!candyMachine.state.gatekeeper.expireOnUse) return [3 /*break*/, 8];
                remainingAccounts.push({
                    pubkey: utils_1.CIVIC,
                    isWritable: false,
                    isSigner: false
                });
                _g = (_f = remainingAccounts).push;
                _o = {};
                return [4 /*yield*/, (0, utils_1.getNetworkExpire)(candyMachine.state.gatekeeper.gatekeeperNetwork)];
            case 7:
                _g.apply(_f, [(_o.pubkey = (_p.sent())[0],
                        _o.isWritable = false,
                        _o.isSigner = false,
                        _o)]);
                _p.label = 8;
            case 8:
                if (!candyMachine.state.whitelistMintSettings) return [3 /*break*/, 11];
                mint_1 = new anchor.web3.PublicKey(candyMachine.state.whitelistMintSettings.mint);
                return [4 /*yield*/, (0, utils_1.getAtaForMint)(mint_1, payer)];
            case 9:
                whitelistToken = (_p.sent())[0];
                remainingAccounts.push({
                    pubkey: whitelistToken,
                    isWritable: true,
                    isSigner: false
                });
                if (!candyMachine.state.whitelistMintSettings.mode.burnEveryTime) return [3 /*break*/, 11];
                whitelistBurnAuthority = anchor.web3.Keypair.generate();
                remainingAccounts.push({
                    pubkey: mint_1,
                    isWritable: true,
                    isSigner: false
                });
                remainingAccounts.push({
                    pubkey: whitelistBurnAuthority.publicKey,
                    isWritable: false,
                    isSigner: true
                });
                signers.push(whitelistBurnAuthority);
                return [4 /*yield*/, candyMachine.program.provider.connection.getAccountInfo(whitelistToken)];
            case 10:
                exists = _p.sent();
                if (exists) {
                    instructions.push(spl_token_1.Token.createApproveInstruction(spl_token_1.TOKEN_PROGRAM_ID, whitelistToken, whitelistBurnAuthority.publicKey, payer, [], 1));
                    cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(spl_token_1.TOKEN_PROGRAM_ID, whitelistToken, payer, []));
                }
                _p.label = 11;
            case 11:
                if (candyMachine.state.tokenMint) {
                    transferAuthority = anchor.web3.Keypair.generate();
                    signers.push(transferAuthority);
                    remainingAccounts.push({
                        pubkey: userPayingAccountAddress,
                        isWritable: true,
                        isSigner: false
                    });
                    remainingAccounts.push({
                        pubkey: transferAuthority.publicKey,
                        isWritable: false,
                        isSigner: true
                    });
                    instructions.push(spl_token_1.Token.createApproveInstruction(spl_token_1.TOKEN_PROGRAM_ID, userPayingAccountAddress, transferAuthority.publicKey, payer, [], candyMachine.state.price.toNumber()));
                    cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(spl_token_1.TOKEN_PROGRAM_ID, userPayingAccountAddress, payer, []));
                }
                return [4 /*yield*/, getMetadata(mint.publicKey)];
            case 12:
                metadataAddress = _p.sent();
                return [4 /*yield*/, getMasterEdition(mint.publicKey)];
            case 13:
                masterEdition = _p.sent();
                return [4 /*yield*/, (0, exports.getCandyMachineCreator)(candyMachineAddress)];
            case 14:
                _h = _p.sent(), candyMachineCreator = _h[0], creatorBump = _h[1];
                _k = (_j = instructions).push;
                return [4 /*yield*/, candyMachine.program.instruction.mintNft(creatorBump, {
                        accounts: {
                            candyMachine: candyMachineAddress,
                            candyMachineCreator: candyMachineCreator,
                            payer: payer,
                            wallet: candyMachine.state.treasury,
                            mint: mint.publicKey,
                            metadata: metadataAddress,
                            masterEdition: masterEdition,
                            mintAuthority: payer,
                            updateAuthority: payer,
                            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            systemProgram: web3_js_1.SystemProgram.programId,
                            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                            recentBlockhashes: anchor.web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
                            instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
                        },
                        remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined
                    })];
            case 15:
                _k.apply(_j, [_p.sent()]);
                _p.label = 16;
            case 16:
                _p.trys.push([16, 18, , 19]);
                return [4 /*yield*/, (0, connection_1.sendTransactions)(candyMachine.program.provider.connection, candyMachine.program.provider.wallet, [instructions, cleanupInstructions], [signers, []])];
            case 17: return [2 /*return*/, (_p.sent()).txs.map(function (t) { return t.txid; })];
            case 18:
                e_2 = _p.sent();
                return [3 /*break*/, 19];
            case 19: return [2 /*return*/, []];
        }
    });
}); };
exports.mintOneToken = mintOneToken;
var shortenAddress = function (address, chars) {
    if (chars === void 0) { chars = 4; }
    return "".concat(address.slice(0, chars), "...").concat(address.slice(-chars));
};
exports.shortenAddress = shortenAddress;
var sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
