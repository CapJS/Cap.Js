
/*
* Permitira generar la función view para la response.
*/

import logger from "../logger.js";
import _ from "lodash";

module.exports = function (req, res, next) {

	/*
	* Generate res.view
	*/
	res.view = function (viewName, locals = {}, cb = null) {
		// Define locals Variables
		locals.__ = req.capjs.i18n.__;

		res.render(viewName, locals, (err, html) => {
			if (err) {
				logger.error(err);
			}

			res.send(html);

			if (cb != null && _.isFunction(cb)) {
				cb(err, html);
			}
		});
		return res;
	}

	return next();
}
