const chalk = require("chalk");

module.exports = class Logger {

    static getDate(){
        return new Date(Date.now()).toLocaleString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    static success(content){
        console.log("[" + Logger.getDate() + "] " + chalk.green("SUCCESS") + ": " + chalk.cyan(content));
    }

    static log(content){
        console.log("[" + Logger.getDate() + "] " + chalk.blue("INFO") + ": " + chalk.cyan(content));
    }

    static warn(content){
        console.log("[" + Logger.getDate() + "] " + chalk.yellow("WARN") + ": " + chalk.cyan(content));
    }

    static error(content, ex){
        if(ex){
            console.log("[" + Logger.getDate() + "] " + chalk.red("ERROR") + ": " + chalk.cyan(content + ": " + ex?.message));
        }else{
            console.log("[" + Logger.getDate() + "] " + chalk.red("ERROR") + ": " + chalk.cyan(content));
        }
    }

    static debug(content){
        console.log("[" + Logger.getDate() + "] " + chalk.magenta("DEBUG") + ": " + chalk.cyan(content));
    }
}