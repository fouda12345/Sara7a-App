import { customAlphabet , urlAlphabet  } from 'nanoid'


export const createOTP = (len = 6) => {
    const nanoid = customAlphabet("0123456789", len);  
    return nanoid();
}