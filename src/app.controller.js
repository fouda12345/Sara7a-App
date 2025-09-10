import authController from "./Modules/auth/auth.controller.js";
import userController from "./Modules/user/user.controller.js";
import messageController from "./Modules/message/message.controller.js";

import successResponse from "./Utils/handlers/successResponse.utils.js";
import errorHandler from "./Utils/handlers/errorHandler.utils.js";

import ConnectDB from "./DB/connection.js"; 
import path from "node:path";
import cors from "cors"
import { Routerlogger } from "./Utils/logger/morgan.utils.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import helmet from "helmet";
import { limiter } from "./Utils/rate-limitter/rateLimitter.utils.js";
const bootstrap = async (app,express) => {

    app.use(helmet());
    app.use(express.json({limit : "1kb"}));
    app.use(express.static(path.resolve("./src")))
    app.use(cors(corsOptions()))
    app.use(limiter)
    await ConnectDB();


    app.use("/api/auth", Routerlogger({logfileName : "auth.log"}), authController);
    app.use("/api/user",Routerlogger({logfileName : "users.log"}), userController);
    app.use("/api/message",Routerlogger({logfileName : "messages.log"}), messageController);

    app.get("/" , (req, res) => {
        successResponse({res , status : 200 , message: "Welcome to Sara7a App API"})
    });
    app.use("/*dummy" , (req, res , next) => {
        next(new Error("Handler Not Found" , {cause : 404}));
    });

    app.use(errorHandler);
};

export default bootstrap;