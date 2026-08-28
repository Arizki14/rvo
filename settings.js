import fs from "fs";
import chalk from "chalk";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

//───────────────< GLOBAL SETTINGS >───────────────\\

global.owner = ["6285854415067"]; // ['628','628'] 2 owner atau lebih
global.author = "Rizz";
global.botname = "Rvo Bot";
global.packname = "Bot WhatsApp";
global.timezone = "Asia/Jakarta"; // Ganti pakai command .settimezone
global.locale = "en"; // Ganti pakai command .setlocale
global.listprefix = ["+", "!", "."];
global.defaultAdminKey = crypto.randomBytes(32).toString("hex");

global.pairing_code = true;
global.number_bot = ""; // Kalo pake panel bisa masukin nomer di sini, jika belum ambil session. Format : '628xx'

global.dns_use = "custom"; // custom / default
global.database = {
	path: "nazedev", // url mongodb / mysql / postgres / folder name local session 'nazedev'
	options: {
		store: true, // jika true ikut path yang diatas. jika false, otomatis local. jika { path: 'url_or_name.json' } menjadi terpisah
		database: true, // jika true ikut path yang diatas. jika false, otomatis local. jika { path: 'url_or_name.json' } menjadi terpisah
	},
};

global.my = {
	yt: "https://youtube.com/c/Nazedev",
	gh: "https://github.com/nazedev",
	gc: "https://chat.whatsapp.com/CPultzDlGoCI3OUvViyZtm",
	ch: "120363250409960161@newsletter",
};

global.limit = {
	free: 20,
	premium: 999,
	vip: 900,
};

global.money = {
	free: 10000,
	premium: 1000000,
	vip: 10000000,
};

global.mess = {
	key: "Apikey limit! Silahkan Upgrade: https://sock.biz.id",
	owner: "Khusus Owner!",
	admin: "Khusus Admin!",
	botAdmin: "Bot harus Admin!",
	onWa: "Nomor tersebut tidak terdaftar di WhatsApp!",
	group: "Khusus Grup!",
	private: "Khusus Private Chat!",
	quoted: "Reply pesannya!",
	limit: "Limit habis!",
	prem: "Khusus Premium!",
	text: "Masukkan teksnya!",
	media: "Kirim medianya!",
	wait: "Proses...",
	fail: "Gagal!",
	error: "Error!",
	done: "Selesai!",
};

global.APIs = {
	naze: "https://api.naze.biz.id",
	neosantara: "https://api.neosantara.xyz/v1",
};
global.APIKeys = {
	"https://api.naze.biz.id": "YOUR_API_KEY",
	"https://api.neosantara.xyz/v1": "API_KEY_NEOSANTARA_AI",
};

// Lainnya
global.jadwalSholat = {
	Subuh: "04:30",
	Dzuhur: "12:06",
	Ashar: "15:21",
	Maghrib: "18:08",
	Isya: "19:00",
};

global.listv = ["•", "●", "■", "✿", "▲", "➩", "➢", "➣", "➤", "✦", "✧", "△", "❀", "○", "□", "♤", "♡", "◇", "♧", "々", "〆"];
global.badWords = ["dongo", "konsol"]; // input kata-kata toxic yg lain. ex: ['dongo','dongonya']
global.chatLength = 1000;

fs.watchFile(__filename, async () => {
	fs.unwatchFile(__filename);
	console.log(chalk.yellowBright(`[UPDATE] ${__filename}`));
	await import(`${import.meta.url}?update=${Date.now()}`);
});
