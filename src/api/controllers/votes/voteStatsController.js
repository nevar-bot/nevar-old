const fs = require("fs");
const moment = require("moment");

exports.getVoteStats = async function(req, res) {
    const { client } = require("@src/app");

    const month = req.params.month || "total";

    if(month === "total"){
        const votes = JSON.parse(fs.readFileSync('./assets/votes.json'));
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(votes, null, 4));
    }

    let months = moment.months().map(m => m.toLowerCase());

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
        const votesObj = {
            month: requestedMonth,
            votes: (votes[requestedMonth] || 0)
        };
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(votesObj, null, 4));
    }else{
        return res.sendStatus(404);
    }
}