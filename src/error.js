class SBLError extends Error {
	/**
	 * SBL Api error
	 * @param {any} message - the error message
	 */
	constructor(message) {
		if (typeof message !== "string") {
			if (typeof message === "object") message = JSON.stringify(message);
			if (message instanceof Buffer || message instanceof Function) message = message.toString();
			// if (p instanceof Promise) m = await p;
		}

		super(message);
	}
}

module.exports = SBLError;
