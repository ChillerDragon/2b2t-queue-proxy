const mineflayer = require('mineflayer')

require('dotenv').config({ debug: false })

if(typeof process.env.MC_USERNAME != 'string') {
  console.log("You have to set MC_USERNAME in your .env file")
  process.exit(1)
}

console.log(`Usine minecraft account '${process.env.MC_USERNAME}'`)

const bot = mineflayer.createBot({
  host: process.env.SERVER_HOST || '2b2t.org',
  username: process.env.MC_USERNAME,
  auth: 'microsoft',
  // version: false, // TODO: set this to 2b2t version
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

bot.on('chat', (username, message) => {
  console.log(`[chat] ${username}: ${message}`)
})

bot.on('kicked', console.log)
bot.on('error', console.log)
