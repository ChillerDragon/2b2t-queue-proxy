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
  // version: false, // TODO: set this to 2b2t version which is 1.21.4
  // password: '12345678'      // set if you want to use password-based auth (may be unreliable). If specified, the `username` must be an email
})

bot.on('chat', (username, message) => {
  console.log(`[chat] ${username}: ${message}`)
})

bot.on('kicked', console.log)
bot.on('error', console.log)

// ------------

const mc = require('minecraft-protocol')
const nbt = require('prismarine-nbt')
const server = mc.createServer({
  'online-mode': false,   // optional
  host: '0.0.0.0',       // optional
  port: 25565,           // optional
  version: '1.21.4' // TODO: the official readme uses a different version here maybe that is the issue
})
const mcData = require('minecraft-data')(server.version)

function chatText (text) {
  return mcData.supportFeature('chatPacketsUseNbtComponents')
    ? nbt.comp({ text: nbt.string(text) })
    : JSON.stringify({ text })
}

server.on('playerJoin', function(client) {
  const loginPacket = mcData.loginPacket

  client.write('login', {
    ...loginPacket,
    enforceSecureChat: false,
    entityId: client.id,
    hashedSeed: [0, 0],
    maxPlayers: server.maxPlayers,
    viewDistance: 10,
    reducedDebugInfo: false,
    enableRespawnScreen: true,
    isDebug: false,
    isFlat: false
  })

  client.write('position', {
    x: 0,
    y: 255,
    z: 0,
    yaw: 0,
    pitch: 0,
    flags: 0x00
  })

  const message = {
    translate: 'chat.type.announcement',
    with: [
      'Server',
      'Hello, world!'
    ]
  }
  if (mcData.supportFeature('signedChat')) {
    client.write('player_chat', {
      plainMessage: message,
      signedChatContent: '',
      unsignedChatContent: chatText(message),
      type: mcData.supportFeature('chatTypeIsHolder') ? { chatType: 1 } : 0,
      senderUuid: 'd3527a0b-bc03-45d5-a878-2aafdd8c8a43', // random
      senderName: JSON.stringify({ text: 'me' }),
      senderTeam: undefined,
      timestamp: Date.now(),
      salt: 0n,
      signature: mcData.supportFeature('useChatSessions') ? undefined : Buffer.alloc(0),
      previousMessages: [],
      filterType: 0,
      networkName: JSON.stringify({ text: 'me' })
    })
  } else {
    client.write('chat', { message: JSON.stringify({ text: message }), position: 0, sender: 'me' })
  }
})
