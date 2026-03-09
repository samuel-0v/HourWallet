import Fastify from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyJWT from "@fastify/jwt"
import { ACCESS_SECRET, REFRESH_SECRET } from "./utils/jwt"

import authRoutes from "./routes/auth.routes";
import { IAuthService, IAuthController, IUserRepository } from "./types/user";
import { UserRepository } from "./repositories/user.repository";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";

import userRoutes from "./routes/user.routes";
import { IUserController, IUserService } from "./types/user";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

import WorkEntriesRoutes from "./routes/workEntries.routes";
import { IWorkEntriesService, IWorkEntriesRepository, IWorkEntriesController } from "./types/workEntries";
import { WorkEntriesRepository } from "./repositories/workEntries.repository";
import { WorkEntriesService } from "./services/workEntries.service";
import { WorkEntriesController } from "./controllers/workEntries.controller";

export const app = Fastify()

app.register(fastifyJWT, {
  secret: ACCESS_SECRET,
  namespace: "access",
  jwtVerify: "accessJwtVerify",
  jwtSign: "accessJwtSign",
  sign: { expiresIn: "15m" },
})

app.register(fastifyJWT, {
  secret: REFRESH_SECRET,
  namespace: "refresh",
  jwtVerify: "refreshJwtVerify",
  jwtSign: "refreshJwtSign",
  sign: { expiresIn: "7d" },
})

app.register(fastifyStatic, {
  root: `${__dirname}/../public`,
  prefix: "/"
})

const userRepo: IUserRepository = new UserRepository();
const authService: IAuthService = new AuthService(userRepo);
const authController: IAuthController = new AuthController(authService);
const userService: IUserService = new UserService(userRepo);
const userController: IUserController = new UserController(userService);

const timeRepo: IWorkEntriesRepository = new WorkEntriesRepository();
const timeService: IWorkEntriesService = new WorkEntriesService(timeRepo, userRepo);
const timeController: IWorkEntriesController = new WorkEntriesController(timeService);


app.register(async (app) => {
  await authRoutes(app, authController);
}, { prefix: "/auth" })

app.register(async (app) => {
  await userRoutes(app, userController);
}, { prefix: "/users" })

app.register(async (app) => {
  await WorkEntriesRoutes(app, timeController);
}, { prefix: "/work-entries" })

app.get("/ping", async () => {
  return { message: "Pong" }
})