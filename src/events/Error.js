module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async dispatch(e) {
        console.error(e);
        await this.client.alertException(e);
    }
}