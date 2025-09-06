import { findById, findOne } from "../DB/DBservices.js";
import { tokenModel } from "../DB/Models/token/token.model.js";
import { UserModel } from "../DB/Models/user/user.model.js";
import { Tokens, verifyToken } from "../Utils/encryption/jwt.utils.js";


export const auth = ( {REFRESH = false} = {} ) =>{
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) return next(new Error("Authorization header is missing", { cause: 401 }));
        const [bearer , token] = authorization.split(" ");
        if (!bearer || !token) return next(new Error("Invalid authorization format", { cause: 401 }));
        let type = REFRESH ? "REFRESH" : "ACCESS";
        let tokenType;
        for (let role in Tokens) {
            if (bearer === Tokens[role].BEARER) {
                tokenType = Tokens[role][type];
                break;
            }
        }
        if (!tokenType) return next(new Error("Invalid authorization bearer", { cause: 401 }));
        const decodedToken = await verifyToken(token, tokenType);
        if (decodedToken.jti && await findOne({ model: tokenModel, filter: { jwtid: decodedToken.jti } })) return next(new Error("token revoked", { cause: 401 }));
        const user =  await findById({model : UserModel , id : decodedToken._id }) 
        if (!user) return next(new Error("Invalid token or user not found", { cause: 401 }));

        if (user.credentialsUpdatedAt.getTime() > decodedToken.iat * 1000) {
            return next(new Error("credentials expired, please login again", { cause: 401 }));
        }
        req.decoded = decodedToken;
        req.user = user;
        next();
    };
}
