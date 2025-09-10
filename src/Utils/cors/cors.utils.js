
export function corsOptions(){
    const whitelist = process.env.CORS_WHITELIST.split(',');
    const corsOptions = {
      origin: function (origin, callback) {
        if (whitelist.includes(origin) || !origin) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    }
    return corsOptions;
}