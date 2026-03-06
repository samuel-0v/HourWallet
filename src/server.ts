import { app } from "./app"

async function start() {
  await app.listen({
    port: 3333,
    host: "0.0.0.0"
  })

  console.log("Server running")
}

start()