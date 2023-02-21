const pino = require("pino");

const pinoLogger = pino.default(
    {
        level: "debug",
    },
    pino.multistream([
        {
            level: "info",
            stream: pino.transport({
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "dd.mm.yyyy HH:MM:ss",
                    ignore: "pid,hostname",
                    singleLine: false,
                    hideObject: true,
                    customColors: "info:blue,warn:yellow,error:red",
                },
            }),
        }
    ])
);

module.exports = class Logger {
    static success(content){
        pinoLogger.info(content);
    }

    static log(content){
        pinoLogger.info(content);
    }

    static warn(content){
        pinoLogger.warn(content);
    }

    static error(content, ex){
        if(ex){
            pinoLogger.error(ex, content + ":" + ex?.message);
        }else{
            pinoLogger.error(content);
        }
        // TODO: webhook logger
    }

    static debug(content){
        pinoLogger.debug(content);
    }
}