/**
 * Installs all the files necessary for the bot to run smoothly
 */
require("module-alias/register");
const logger = require("@helpers/Logger");
const fs = require('fs');
const moment = require("moment");

logger.log('Installation started..', "debug");

// -> Create the config file
const configText = fs.readFileSync('./assets/config.txt', 'utf8').toString()
    .replace('{version}', require('@root/package.json').version)

fs.writeFile('config-sample.toml', configText, async function(error){
    if(error){
        logger.log("Couldn't create config", "error")
        console.error(new Error(error));
    }
    else{
        logger.log("Successfully generated config file", "success")
    }
});


// -> Create all the necessary files

const disabledCommands = [];
const news = {
    "timestamp": Date.now(),
    "text": "Installed the bot"
}
const months = moment.months();
const voteObject = {};
for(let i = 1; i <= 12; i++) voteObject[months[i-1].toLowerCase()] = 0;

fs.writeFile('./assets/disabled.json', JSON.stringify(disabledCommands, null, 4), function(error){
    if(error){
        logger.log("Couldn't create assets/disabled.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created assets/disabled.json', "success");
    }
});

fs.writeFile('./assets/news.json', JSON.stringify(news, null, 4), function(error){
    if(error){
        logger.log("Couldn't create assets/news.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created assets/news.json', "success");
    }
});

fs.writeFile('./assets/votes.json', JSON.stringify(voteObject, null, 4), function(error){
    if(error){
        logger.log("Couldn't create assets/votes.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created assets/votes.json', "success");
    }
});
