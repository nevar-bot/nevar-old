const fs = require("fs");
const moment = require("moment");

async function get(req, res){
    const { app } = req;
    const { client } = require("@src/app");

    const month = req.params.month;

    if(!month){
        const votes = JSON.parse(fs.readFileSync('./assets/votes.json'));
        const json = {
            status_code: 200,
            status_message: null,
            res: votes
        }
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(json, null, 4));
    }

    const months = moment.months().map(m => m.toLowerCase());
    let requestedMonth;

    if(months.includes(month.toLowerCase())){
        requestedMonth = months[months.indexOf(month.toLowerCase())];
    }else{
        if(months[parseInt(month) - 1] !== undefined){
            requestedMonth = months[parseInt(month) - 1];
        }
    }

    if(requestedMonth){
        const votes = JSON.parse(fs.readFileSync('./assets/votes.json'));
        const json = {
            status_code: 200,
            status_message: null,
            res: {
                month: requestedMonth,
                votes: (votes[requestedMonth] || 0)
            }
        };
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(json, null, 4));
    }else{
        return res.sendStatus(404);
    }
}

module.exports = { get };