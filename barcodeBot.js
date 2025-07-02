const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Setup your bot token
const TOKEN = 'MTM5MDA2OTA1NDg1Njg5MjUwNw.GRklCS.VvTEUQjTx6zeyI_rR6WQF342lJbP1lhjH-idqs';

// Characters allowed in barcodes
const barcodeChars = ['I', 'L'];

// Initial reserved barcodes
const initialBarcodes = new Set([
  "XIIII.L.IIIIX", "XIIII.L.IIILX", "XIIII.L.IILLX", "XIIII.L.ILIIX",
  "XIIII.L.LIIIIX", "XIIIL.L.IIIIX", "XLIIII.L.IIIIX", "XIIIL.L.ILIIX",
  "XIILL.L.IILLX", "XIIII.L.LLIIX", "XILLI.L.IIIIX", "XIILI.L.IIIIX",
  "XIILI.L.ILIIX", "XILIL.L.IIIIX", "XILII.L.IIILX", "XLIII.L.ILIIX",
  "XIIII.L.LILIX", "XIIII.L.LLLLX", "XLILI.L.IIIIX", "XIIII.L.LILIX",
  "XIIIL.L.LILIX"
]);

// File for persistent storage
const DB_FILE = path.join(__dirname, 'barcodes.json');

// Load or initialize barcode memory
let usedBarcodes = new Set();
if (fs.existsSync(DB_FILE)) {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  usedBarcodes = new Set(data);
} else {
  usedBarcodes = new Set(initialBarcodes);
  fs.writeFileSync(DB_FILE, JSON.stringify([...usedBarcodes], null, 2));
}

function saveToDisk() {
  fs.writeFileSync(DB_FILE, JSON.stringify([...usedBarcodes], null, 2));
}

function generateBarcode() {
  let attemptLimit = 10000;
  while (attemptLimit-- > 0) {
    const part1 = Array.from({ length: 4 }, () => barcodeChars[Math.floor(Math.random() * barcodeChars.length)]).join('');
    const part2 = Array.from({ length: 4 }, () => barcodeChars[Math.floor(Math.random() * barcodeChars.length)]).join('');
    const code = `X${part1}.L.${part2}X`;
    if (!usedBarcodes.has(code)) {
      usedBarcodes.add(code);
      saveToDisk();
      return code;
    }
  }
  return null; // All combinations exhausted
}

// Discord bot setup
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Command: !generate <count>
client.on('messageCreate', message => {
  if (!message.content.startsWith('/generate')) return;

  const parts = message.content.trim().split(/\s+/);
  const count = parseInt(parts[1]);

  if (isNaN(count) || count <= 0 || count > 100) {
    return message.reply("❌ Please provide a valid number (1–100). Usage: `!generate 5`");
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    const code = generateBarcode();
    if (code) {
      results.push(code);
    } else {
      results.push("[NO MORE UNIQUE BARCODES]");
      break;
    }
  }

  message.reply("✅ Generated barcodes:\n```\n" + results.join("\n") + "\n```");
});

client.login(TOKEN);