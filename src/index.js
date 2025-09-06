import express from 'express';
const port = Number(process.env.APP_PORT);
const app = express();
import bootstrap from "./app.controller.js";

await bootstrap(app , express)

app.listen(port, () => {
    console.log(`Sara7aApp listening on port ${port}`)
})