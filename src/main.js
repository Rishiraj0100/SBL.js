const EventEmitter = require("eventemitter3");
const phin = require("phin");
const SBLError = require("./error");
const fetch = require("node-fetch");

class SBLApi extends EventEmitter {
	/**
	 * main class
	 * @param {string} id - the clients id
	 * @param {string} token - the clients api token
	 */
	constructor(id, token) {
		if (!id) throw new TypeError("missing client id");
		if (!token) throw new TypeError("missing token");
		
		super();

		this._id = id;
		this._token = token;
	}

	get id() {
		return this._id;
	}

	get token() {
		return this._token;
	}


	/**
	 * Fetches a bot's like info, will return null if the bot does not exist
	 * @param {string} [id] - client id, if different from current client id
	 * @param {string} [auth] - different authorization to use, if needed
	 * @returns {Promise<APIBotLikes>} 
	 */
	async getBotLikes(id = this.id, auth = this.token) {
		if (!id) throw new TypeError("missing bot id");
		return phin({
			url: `https://smartbots.tk/api/auth/liked/${id}/`,
			headers: {
				"authorization": auth
			},
			parse: "json"
		}).then((b) => {
			if (b.statusCode !== 200) switch (b.statusCode) {
				case 400:
				case 401:
				case 403:
					throw new SBLError({
						statusCode: b.statusCode,
						body: b.body,
						type: "request error"
					});
					break;

				case 404:
					return null;
					break;

				case 500:
				case 502:
					throw new SBLError({
						statusCode: b.statusCode,
						body: b.body,
						type: "server error"
					});
					break;

				default:
					throw new SBLError({
						statusCode: b.statusCode,
						body: b.body,
						type: "unknown"
					});
			}
			if (!b.success) {
				throw new SBLError({
					body: b.body,
				});
			}
			return {
				likers: b.body.users
			};
		}).catch(err => {
			throw err;
		});
	}



	/**
	 * post your bots server count stats
	 * @param {number} server_count - the number of servers your bot is in
	 * @param {string} [id] - the id to post stats to, if different from the current id
	 * @param {string} [auth] - different authorization to use, if needed
	 * @returns {Promise<{ success: boolean }>}
	 */
	async postServerCount(server_count = 0, id = this.id, auth = this.token) {
		var ropts = {
			method: "POST",
			url: `https://smartbots.tk/api/auth/stats/${id || this.id}`,
			body: JSON.stringify({"server_count": server_count || 1}),
			headers: {
				"authorization": auth || this.token,
				"Content-Type": "application/json"
			}
		}
		fetch(ropts.url,ropts).then((response) => {return response.text()}).catch(console.error);
	}
}

module.exports = SBLApi;



/**
 * @typedef {object} APIBotLikes
 * @prop {string[]} likers - the likers of last 12 hours
 */

/**
 * @prop {string} id - the current api bot's id
 * @prop {string} token - the current api token
 */
