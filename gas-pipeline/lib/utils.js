module.exports = {

	// helper method for writing out json payloads
	json : function(res, data) {
		res.writeHead(200, {
			'Content-Type' : 'application/json; charset=utf-8'
		});

		if (typeof data === "string") {
			res.write(data);
		} else {
			res.write(JSON.stringify(data));
		}

		res.end();
	},
};
