import { findById, findOne } from "../DB/DBservices.js";
import { tokenModel } from "../DB/Models/token/token.model.js";
import { UserModel } from "../DB/Models/user/user.model.js";
import { Tokens, verifyToken } from "../Utils/encryption/jwt.utils.js";


export const auth = ( {refresh = false , required = true} = {} ) =>{
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization && required) return next(new Error("Authorization header is missing", { cause: 401 }));
        const [bearer , token] = authorization?.split(" ") || [];
        if ((!bearer || !token) && authorization) return next(new Error("Invalid authorization format", { cause: 401 }));
        let type = refresh ? "REFRESH" : "ACCESS";
        let tokenType;
        for (let role in Tokens) {
            if (bearer === Tokens[role].BEARER) {
                tokenType = Tokens[role][type];
                break;
            }
        }
        if (!tokenType && authorization) return next(new Error("Invalid authorization bearer", { cause: 401 }));
        const decodedToken =  tokenType ? await verifyToken(token, tokenType) : null;
        if (decodedToken?.jti && await findOne({ model: tokenModel, filter: { jwtid: decodedToken.jti } })) return next(new Error("token revoked", { cause: 401 }));
        const user =  decodedToken ? await findById({model : UserModel , id : decodedToken._id })  : null;
        if (!user && authorization) return next(new Error("Invalid token or user not found", { cause: 401 }));

        if (user?.credentialsUpdatedAt?.getTime() > decodedToken?.iat * 1000) {
            return next(new Error("credentials expired, please login again", { cause: 401 }));
        }
        req.decoded = decodedToken;
        req.user = user;
        next();
    };
}
