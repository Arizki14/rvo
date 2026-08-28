import "./settings.js";
import { logInfo } from "./src/cli/helpers.js";
import fs from "fs";
import os from "os";
import util from "util";
import path from "path";
import chalk from "chalk";
import yts from "yt-search";
import webp from "node-webpmux";
import { Chess } from "chess.js";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { performance } from "perf_hooks";
import { exec, execSync } from "child_process";
import { parsePhoneNumber } from "awesome-phonenumber";
import baileys, { generateWAMessageContent, jidNormalizedUser, getContentType } from "baileys";

import { UguuSe } from "./lib/uploader.js";
import TicTacToe from "./lib/tictactoe.js";
import { werewolf } from "./lib/werewolf.js";
import templateMenu from "./lib/template_menu.js";
import { ytMp4, ytMp3, ytMp4Stream } from "./lib/scraper.js";
import { GroupUpdate, LoadDataBase } from "./src/message.js";
import { CloneBot, StopCloneBot, ListCloneBot } from "./src/clonebot.js";
import { toAudio, toPTT, toVideo, toGif, toImage } from "./lib/converter.js";
import { cmdAdd, cmdAddHit, addExpired, getPosition, getExpired, getStatus, checkStatus } from "./src/database.js";
import { rdGame, iGame, gameSlot, gameCasinoSolo, gameSamgongSolo, gameMerampok, gameBegal, daily, buy, setLimit, addLimit, addMoney, setMoney, transfer, Cangkulan, SnakeLadder, getChessAI } from "./lib/game.js";
import { getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, extractUrl, formatDate, formatp, generateProfilePicture, errorCache, antiSpam, runUpdate, updateSettings, parseMention, fixBytes, similarity, pickRandom, encodeToLetters, tarBackup } from "./lib/function.js";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timez = Intl.supportedValuesOf("timeZone");
const menfesTimeouts = new Map();
const settingsPath = path.join(__dirname, "settings.js");
let canvasModule = null;

/*
 * Create By Naze
 * Follow https://github.com/nazedev
 * Whatsapp : https://whatsapp.com/channel/0029VaWOkNm7DAWtkvkJBK43
 */

try {
	canvasModule = await import("@napi-rs/canvas");
	canvasModule.GlobalFonts.registerFromPath("./src/nulis/font/Indie-Flower.ttf", "Indie Flower");
	logInfo("Fast Mode (Canvas) Active 🚀");
} catch (error) {
	logInfo("Canvas not found. Fallback PureImage Active 🐢");
}

const fileContent = fs.readFileSync(__filename, "utf-8");
const casesArray = [...fileContent.matchAll(/case\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);

const sock = async (sock, m, store) => {
	if (!global.db) global.db = {};
	global.db.cases = global.db.cases || casesArray;
	const cases = global.db.cases;

	await LoadDataBase(sock, m);

	const botNumber = sock.decodeJid(sock.user.id);
	const db = global.db;
	const mess = global.mess;

	// Read Database
	const set = db.set[botNumber];
	
	const ownerNumber = (set.owner = [...new Set([...global.owner, botNumber.split("@")[0], ...(set?.owner || [])])]);

	try {
		await GroupUpdate(sock, m, store);

		const body =
			(m.type === "conversation"
				? m.message.conversation
				: m.type == "imageMessage"
					? m.message.imageMessage.caption
					: m.type == "videoMessage"
						? m.message.videoMessage.caption
						: m.type == "extendedTextMessage"
							? m.message.extendedTextMessage.text
							: m.type == "reactionMessage"
								? m.message.reactionMessage.text
								: m.type == "buttonsResponseMessage"
									? m.message.buttonsResponseMessage.selectedButtonId
									: m.type == "listResponseMessage"
										? m.message.listResponseMessage.singleSelectReply.selectedRowId
										: m.type == "templateButtonReplyMessage"
											? m.message.templateButtonReplyMessage.selectedId
											: m.type == "interactiveResponseMessage" && m.quoted
												? m.message.interactiveResponseMessage?.nativeFlowResponseMessage
													? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
													: ""
												: m.type == "messageContextInfo"
													? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || ""
													: m.type == "editedMessage"
														? m.message.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || ""
														: m.type == "protocolMessage"
															? m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
																m.message.protocolMessage?.editedMessage?.conversation ||
																m.message.protocolMessage?.editedMessage?.imageMessage?.caption ||
																m.message.protocolMessage?.editedMessage?.videoMessage?.caption ||
																""
															: "") || "";

		const budy = typeof m.text == "string" ? m.text : "";
		const isCreator = (global.isOwner = ownerNumber.some((owner) => {
			const ownerJid = owner.includes("@") ? owner : owner + "@s.whatsapp.net";
			const findJid = sock.findJidByLid(jidNormalizedUser(ownerJid), store, true);
			if (!findJid) return false;
			return findJid === m.sender || findJid === jidNormalizedUser(m.sender) || findJid === sock.findJidByLid(m.sender, store, true);
		}));
		
		const symbolMatch = body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi);
		const emojiMatch = body.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]/gi);
		const listMatch = global.listprefix.find((a) => body?.startsWith(a));
		const detectedPrefix = symbolMatch ? symbolMatch[0] : emojiMatch ? emojiMatch[0] : listMatch;
		const prefix = isCreator ? detectedPrefix || set.authorPrefix : set.multiprefix ? detectedPrefix || "¿" : listMatch || "¿";
		const isCmd = body.startsWith(prefix);
		const args = body.trim().split(/ +/).slice(1);
		const quoted = m.quoted ? m.quoted : m;
		const command = isCmd ? body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : "";
		const text = (global.q = args.join(" "));
		const mime = (quoted.msg || quoted).mimetype || "";
		const qmsg = quoted.msg || quoted;
		const author = (set.author = global.author || "Nazedev");
		const packname = (set.packname = global.packname || "Bot WhatsApp");
		const botname = (set.botname = global.botname || "Hitori Bot");
		const badWordsLower = global.badWords.map((v) => v.toLowerCase());
		const now_dt = new Date();
		const tz_opt = { timeZone: global.timezone };
		const locale_day = now_dt.toLocaleDateString(global.locale, { ...tz_opt, weekday: "long" });
		const date = now_dt.toLocaleDateString("en-GB", tz_opt);
		const date_time = now_dt.toLocaleTimeString("en-GB", { ...tz_opt, hour12: false });
	
	// Auto Set Bio
		if (set.autobio) {
			if (new Date() * 1 - set.status > 60000) {
				await sock.updateProfileStatus(`${sock.user.name} | 🎯 Runtime : ${runtime(process.uptime())}`).catch((e) => {});
				set.status = new Date() * 1;
			}
		}

		// Set Mode
		if (!isCreator) {
			if (set.grouponly === set.privateonly) {
				if (!sock.public && !m.key.fromMe) return;
			} else if (set.grouponly) {
				if (!m.isGroup) return;
			} else if (set.privateonly) {
				if (m.isGroup) return;
			}

			// Whitelist Chats
			if (set.whitelistonly && sock.public && set.whitelist.length > 0 && !set.whitelist.includes(m.chat)) return;
		}

		// Auto Read
		if (m.message && m.key.remoteJid !== "status@broadcast") {
			if ((set.autoread && sock.public) || isCreator) {
				sock.readMessages([m.key]);
				if (set.log)
					console.log(
						chalk.black(
							chalk.whiteBright("[CHAT]:"),
							chalk.greenBright(`${locale_day} ${date} (${date_time})`),
							chalk.hex("#AF26EB")(m.key.id) + "\n" + chalk.hex("#00EAD3")(budy || m.type) + "\n" + chalk.cyanBright("[FROM]:"),
							chalk.yellowBright(m.pushName || (isCreator ? "Bot" : "Anonim")),
							chalk.hex("#FF449F")(m.sender.split("@")[0]),
							chalk.hex("#FF5700")(m.isGroup ? m.metadata.subject : m.chat.endsWith("@newsletter") ? "Newsletter" : "Private Chat"),
							chalk.blueBright("(" + m.chat + ")"),
						),
					);
				else
					console.log(
						chalk.black(
							chalk.bgWhite("[CHAT]:"),
							chalk.bgGreen(`${locale_day} ${date} (${date_time})`),
							chalk.bgHex("#AF26EB")(m.key.id) + "\n" + chalk.bgHex("#00EAD3")(budy || m.type) + "\n" + chalk.bgCyanBright("[FROM]:"),
							chalk.bgYellow(m.pushName || (isCreator ? "Bot" : "Anonim")),
							chalk.bgHex("#FF449F")(m.sender),
							chalk.bgHex("#FF5700")(m.isGroup ? m.metadata.subject : m.chat.endsWith("@newsletter") ? "Newsletter" : "Private Chat"),
							chalk.bgBlue("(" + m.chat + ")"),
						),
					);
			}
		}

		// Filter event type
		if (m.eventType && m.eventType !== "notify") return;
		
				// Cmd Media
		let fileSha256;
		if (m.isMedia && m.msg.fileSha256 && db.cmd && m.msg.fileSha256.toString("base64") in db.cmd) {
			let hash = db.cmd[m.msg.fileSha256.toString("base64")];
			fileSha256 = hash.text;
		}
		
		
		switch (fileSha256 || command) {
			// Tempat Add Case
	case "readviewonce":
			case "readviewone":
			case "rvo":
				{
					if (!m.quoted) return m.reply(global.mess.quoted);
					try {
						if (m.quoted.msg.viewOnce) {
							delete m.quoted.chat;
							m.quoted.msg.viewOnce = false;
							await m.reply({ forward: m.quoted });
						} else m.reply(`Reply view once message\nExample: ${prefix + command}`);
					} catch (e) {
						m.reply("Media Tidak Valid!");
					}
				}
				break;
			
			default:
				if (budy.startsWith(">")) {
					if (!isCreator) return;
					try {
						let evaled = await eval(budy.slice(2));
						if (typeof evaled !== "string") evaled = util.inspect(evaled);
						await m.reply(evaled);
					} catch (err) {
						await m.reply(String(err));
					}
				}
				if (budy.startsWith("<")) {
					if (!isCreator) return;
					try {
						let evaled = await eval(`(async () => { ${budy.slice(2)} })()`);
						if (typeof evaled !== "string") evaled = util.inspect(evaled);
						await m.reply(evaled);
					} catch (err) {
						await m.reply(String(err));
					}
				}
				if (budy.startsWith("$")) {
					if (!isCreator) return;
					if (!text) return;
					exec(budy.slice(2), (err, stdout) => {
						if (err) return m.reply(`${err}`);
						if (stdout) return m.reply(stdout);
					});
				}
				if ((!isCmd || isCreator) && budy.toLowerCase() != undefined) {
					if (m.chat.endsWith("broadcast")) return;
					if (!(budy.toLowerCase() in db.database)) return;
					await sock.relayMessage(m.chat, db.database[budy.toLowerCase()], {});
				}
		}
	} catch (e) {
		console.log(e);
		if (e?.message?.includes("No sessions") || e?.message?.includes("ffmpeg exited with code") || e?.code === "ERR_FR_MAX_BODY_LENGTH_EXCEEDED" || e?.message?.includes("maxBodyLength limit") || e?.message?.includes("rate-overlimit")) return;
		const errorKey = e?.code || e?.name || e?.message?.slice(0, 100) || "unknown_error";
		const now = Date.now();
		if (!errorCache[errorKey]) errorCache[errorKey] = [];
		errorCache[errorKey] = errorCache[errorKey].filter((ts) => now - ts < 600000);
		if (errorCache[errorKey].length >= 3) return;
		errorCache[errorKey].push(now);
		const isAxiosError = false;
		const statusCode = e?.response?.status || e?.statusCode || e?.data;
		const errorUrl = e?.config?.url || e?.request?.host || "";
		if (statusCode === 500) {
			m.reply("Server API Error: Terjadi gangguan pada server tujuan.");
		} else if (statusCode === 429) {
			if (errorUrl.includes("api.naze.biz.id")) {
				return m.reply("Limit Reached: " + mess.key);
			} else m.reply("Limit Reached (Sistem/WA): Terlalu banyak permintaan.\nLog Error Telah dikirim ke Owner");
		} else if (statusCode === 403) {
			if (isAxiosError) {
				if (errorUrl.includes("api.naze.biz.id")) {
					return m.reply("Akses Khusus Premium!");
				} else m.reply("API Error: Akses ke server API ditolak (403 Forbidden).");
			} else console.log(chalk.yellowBright("[SYSTEM] Akses grup ditolak (Baileys 403 / Forbidden)."));
		} else if (statusCode === 401) {
			if (isAxiosError) {
				if (errorUrl.includes("api.naze.biz.id")) {
					return m.reply("Invalid Apikey!");
				} else m.reply("API Error: Akses ke server API ditolak (401 Unauthorized).");
			} else console.log(chalk.yellowBright("[SYSTEM] Akses ditolak (401 Unauthorized)."));
		} else m.reply("Error: " + (e?.name || e?.code || e?.message || "Terjadi kesalahan tidak diketahui") + "\nLog Error Telah dikirim ke Owner\n\n");
		return sock.sendFromOwner(ownerNumber, `Halo sayang, sepertinya ada yang error nih, jangan lupa diperbaiki ya\n\nVersion : *${require("./package.json").version}*\nType : *${m.type || errorKey}*\n\n*Log error:*\n\n` + util.format(e), m, { contextInfo: { isForwarded: true } });
	}
};

export default sock;

	