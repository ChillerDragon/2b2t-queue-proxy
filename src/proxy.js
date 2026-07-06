const { InstantConnectProxy } = require('prismarine-proxy')


require('dotenv').config({ debug: false })

if(typeof process.env.MC_USERNAME != 'string') {
  console.log("You have to set MC_USERNAME in your .env file")
  process.exit(1)
}

console.log(`Usine minecraft account '${process.env.MC_USERNAME}'`)

const login = process.env.MC_USERNAME

const proxy = new InstantConnectProxy({
  loginHandler: (client) => { // client object has a username object, so you can store usernames with their respective logins
    return { username: login, auth: 'microsoft' } // the login the proxy will connect to the server with
  },
  serverOptions: { // options for the local server shown to the vanilla client
    version: '1.21.4'
  },
  clientOptions: { // options for the client that will connect to the proxied server
    version: '1.21.4',
    host: process.env.SERVER_HOST || '2b2t.org'
  }
})

proxy.on('incoming', (data, meta, toClient, toServer) => { // packets incoming from the server to the client
  if (meta.name === 'world_particles') return // for 1.8.9, world_particles is the packet that contains particles, so by returning here, the client connected to the proxy won't get any particles
  toClient.write(meta.name, data) // otherwise send the packet to the client
})

proxy.on('outgoing', (data, meta, toClient, toServer) => { // packets outgoing from the client to the server
  if (meta.name === 'chat') console.log(data.message) // for 1.8.9, chat is the packet that the client sends to send a chat message to the server, so by using console.log, we can sniff the message before it hits the server, and even return early so it wouldn't hit the server
  toServer.write(meta.name, data) // otherwise send the packet to the client
})
