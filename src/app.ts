import Fastify from "fastify"
import fastifyStatic from "@fastify/static"

export const app = Fastify()
app.register(fastifyStatic, {
  root: `${__dirname}/../public`,
  prefix: "/"
})

app.get("/ping", async () => {
  return { message: "Pong" }
})