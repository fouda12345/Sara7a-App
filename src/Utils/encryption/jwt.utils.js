import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import dotenv from 'dotenv';
dotenv.config({path: "./src/config/.env"});
export const Tokens = {
    user: {
        BEARER : process.env.USER_TOKEN_BEARER_KEY,
        ACCESS: {
            expiresIn: process.env.DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
            secretKey: process.env.USER_TOKEN_ACCESS_KEY
        },
        REFRESH: {
            expiresIn: process.env.DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
            secretKey: process.env.USER_TOKEN_REFRESH_KEY
        },
    },
    admin: {
        BEARER : process.env.ADMIN_TOKEN_BEARER_KEY,
        ACCESS: {
            expiresIn: process.env.DEFAULT_ACCESS_TOKEN_EXPIRES_IN,
            secretKey: process.env.ADMIN_TOKEN_ACCESS_KEY
        },
        REFRESH: {
            expiresIn: process.env.DEFAULT_REFRESH_TOKEN_EXPIRES_IN,
            secretKey: process.env.ADMIN_TOKEN_REFRESH_KEY
        },
    },
}


Object.freeze(Tokens);

export const createToken = async ({data  , tokenType , options = { expiresIn : tokenType.expiresIn , jwtid : nanoid() }}) => {
    return await jwt.sign( 
        data, 
        tokenType.secretKey || Tokens.user.ACCESS.secretKey , 
        options
    );
}

export const verifyToken = async (token , tokenType) => {   
    return await jwt.verify(token, tokenType.secretKey);
}
