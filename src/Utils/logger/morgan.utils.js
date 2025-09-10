import morgan from "morgan";
import fs from 'node:fs'
import path from "node:path";
export const Routerlogger = ({logfileName}) => {
    const logFilePath = path.join(path.resolve(), "./src/logs", logfileName || "access.log")
    if (!fs.existsSync(path.dirname(logFilePath))) {
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    }
    const logStream = fs.createWriteStream(
        logFilePath,
        { flags: 'a'}
    )
    return morgan('dev', { stream: logStream })
}