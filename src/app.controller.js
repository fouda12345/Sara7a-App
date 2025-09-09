import authController from "./Modules/auth/auth.controller.js";
import userController from "./Modules/user/user.controller.js";
import ConnectDB from "./DB/connection.js"; 
import errorHandler from "./Utils/handlers/errorHandler.utils.js";
import path from "node:path";
import successResponse from "./Utils/handlers/successResponse.utils.js";
import messageController from "./Modules/message/message.controller.js";

const bootstrap = async (app,express) => {

    app.use(express.json());
    app.use(express.static(path.resolve("./src")))
    await ConnectDB();

    app.use("/auth", authController);
    app.use("/user", userController);
    app.use("/message", messageController);

    app.get("/" , (req, res) => {
        successResponse({res , status : 200 , message: "Welcome to Sara7a App API"})
    });
    app.use("/*dummy" , (req, res , next) => {
        next(new Error("Handler Not Found" , {cause : 404}));
    });

    app.use(errorHandler);
};

export default bootstrap;