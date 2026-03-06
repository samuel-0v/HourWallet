import Fastify from "fastify"
import fastifyStatic from "@fastify/static"

import authRoutes from "./routes/auth.routes";
import { IAuthService, IAuthController, IAuthRepository } from "./types/user";

import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";


import timeEntryRoutes from "./routes/timeEntry.routes";
import { ITimeEntryService, ITimeEntryRepository, ITimeEntryController } from "./types/timeEntry";
import { TimeEntryController } from "./controllers/timeEntry.controller";
import { TimeEntryService } from "./services/timeEntry.service";
import { TimeEntryRepository } from "./repositories/timeEntry.repository";


export const app = Fastify()
app.register(fastifyStatic, {
  root: `${__dirname}/../public`,
  prefix: "/"
})

const authRepo: IAuthRepository = new AuthRepository();
const authService: IAuthService = new AuthService(authRepo);
const authController: IAuthController = new AuthController(authService);

const timeRepo: ITimeEntryRepository = new TimeEntryRepository();
const timeService: ITimeEntryService = new TimeEntryService(timeRepo);
const timeController: ITimeEntryController = new TimeEntryController(timeService);

app.register(async (app) => {
  await authRoutes(app, authController);
}, { prefix: "/auth" })

app.register(async (app) => {
  await timeEntryRoutes(app, timeController);
}, { prefix: "/time-entries" })

app.get("/ping", async () => {
  return { message: "Pong" }
})