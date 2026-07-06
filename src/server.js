const mc = require("minecraft-protocol")

const server = mc.createServer({
  host: "127.0.0.1",
  port: 25565,
  version: "1.21.4",
  "online-mode": false,
})
server.on("login", (client) => {
  const originalWrite = client.write.bind(client)

  client.write = function(name, params) {
    console.log("SEND:", name, params)

    return originalWrite(name, params)
  }
})
