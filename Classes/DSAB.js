const fetch = require('node-fetch');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');
const util = require('util');
const streamPipeline = util.promisify(require('stream').pipeline)

const seasonsURL = "https://dsab-vfs.de/VFSProject/WebObjects/VFSProject.woa/wa/rangListen?ligagruppe=50&typ=saisons";

const leagueName = "C-Liga 01 501 S.O.";

module.exports = class DSAB {
    async getCurrentSeasonId() {
        let response = await fetch(seasonsURL);
        let body1 = await response.text();

        let $ = cheerio.load(body1);

        let latestSeason = $('#content > div > table > tbody > tr:nth-child(2) > td:nth-child(1) > b > a');

        let currentSeasonId = latestSeason.attr('href');
        
        let queryObject = url.parse(currentSeasonId, true).query;

        return queryObject.saison;
    }

    async getLeaugeId(seasonId) {
        const leagueURL = `https://dsab-vfs.de/VFSProject/WebObjects/VFSProject.woa/wa/rangListen?typ=saisonLigen&saison=${seasonId}`;
        let response = await fetch(leagueURL);
        let body1 = await response.text();

        let $ = cheerio.load(body1);

        let currentLeagueId = $(`tr:contains('${leagueName}') > td:nth-child(3) > a`).attr('href');
        
        let queryObject = url.parse(currentLeagueId, true).query;

        return queryObject.liga;
    }

    async getGamePlan(seasonId, leagueId) {
        let gamePlanUrl = `https://dsab-vfs.de/VFSProject/WebObjects/VFSProject.woa/wa/rangListen?liga=${leagueId}&typ=partienplanPDF&saison=${seasonId}`;
        let response = await fetch(gamePlanUrl);
        let targetPath = `./tmp/gameplan/${seasonId}/`;
        let targetFileName = `${leagueId}.pdf`;
        
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        await streamPipeline(response.body, fs.createWriteStream(targetPath + targetFileName))

        return targetPath + targetFileName;
    }

    async getRanking(seasonId, leagueId) {
        let gamePlanUrl = `https://dsab-vfs.de/VFSProject/WebObjects/VFSProject.woa/wa/rangListen?liga=${leagueId}&typ=teamrangPDF&saison=${seasonId}`;
        let response = await fetch(gamePlanUrl);
        let targetPath = `./tmp/ranking/${seasonId}/`;
        let targetFileName = `${leagueId}.pdf`;
        
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        await streamPipeline(response.body, fs.createWriteStream(targetPath + targetFileName))

        return targetPath + targetFileName;
    }
}