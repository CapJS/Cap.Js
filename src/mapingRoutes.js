
import _ from "lodash";
import methods from "methods";
import express from "express";
import logger from "./logger.js";
import colors from "colors/safe";
import async from "async";
import ms from "ms";



class mapingRoutes {
	constructor (appExpress, {
		prefix = "",
		maping = null,
		capjs = null
	} = {}) {
		this.app = appExpress;
		this.capjs = capjs;

		if (maping != null) {
			this.maping(maping);
		}
	}

	log (...args) {
		logger.deb(colors.green("Mapping Route:"), ...args);
		return this;
	}
	logInfo (...args) {
		logger.info(colors.green.bold("Mapping Route:"), ...args);
		return this;
	}
	err (...args) {
		logger.error(colors.green("Mapping Route:"), ...args);
		return this;
	}

	// Descompone un pathname
	decodePathCompuest (pathName) {
		if (_.isString(pathName)) {
			let resolve = pathName.trim().replace(/\s+/g, " ").split(" ");
			let method;
			let path;

			// Si existen 2 parametros en la ruta.
			if (resolve.length >= 2) {
				method = _.get(resolve, "[0]").toLowerCase();
				path = _.get(resolve, "[1]").toLowerCase();
			} else {
				path = _.get(resolve, "[0]").toLowerCase();
				method = "get";
			}

			return {
				method,
				path,
			}
		}
	}

	maping (ObjectStructure) {

		// Config x-powered-by
		let xPoweredBy = this.capjs.config("express.x-powered-by", "CapJS");

		if (_.isBoolean(xPoweredBy)) {
			this.app.set("x-powered-by", xPoweredBy);
		} else
		if (_.isString(xPoweredBy)) {
			this.app.set("x-powered-by", false);
			this.app.use((req, res, next) => {
				res.header("X-Powered-By", xPoweredBy);
				return next();
			});
		}
		//End Config x-powered-by


		// Cache Control
		let cacheControl = this.capjs.config("http.cacheControl", ms("7 days"));
		if (_.isNumber(cacheControl)) {
			this.app.use((req, res, next) => {
				res.set("Cache-Control", "public, max-age="+cacheControl);
				return next();
			})
		} else
		if (_.isString(cacheControl)) {
			this.app.use((req, res, next) => {
				res.set("Cache-Control", "public, max-age="+(ms(cacheControl)||cacheControl));
				return next();
			});
		} else
		if (_.isObject(cacheControl)) {
			let maxAge = _.get(cacheControl, "maxAge", ms("7 days"));
			let scope  = _.get(cacheControl, "scope", "public");
			let noCache = _.get(cacheControl, "noCache", false);
			let noStore = _.get(cacheControl, "noStore", false);
			if (noStore == true) {
				this.app.use((req, res, next) => {
					res.set("Cache-Control", "no-store");
					return next();
				});
			} else
			if (noCache == true) {
				this.app.use((req, res, next) => {
					res.set("Cache-Control", "no-cache");
					return next();
				});
			} else {
				this.app.use((req, res, next) => {
					res.set("Cache-Control", `${scope}, max-age=${ms(maxAge)||maxAge}`);
					return next();
				});
			}
		}
		// END Cache-Control



		_.map(ObjectStructure, (routeConfig, keyRoute) => {
			// Configuración del path
			let {method:RouteMethod, path:RoutePath} = this.decodePathCompuest(keyRoute);

			// let RoutePath = "";
			// let RouteMethod = "";

			this.logInfo(`Loading [${RouteMethod}] ${RoutePath}.`)

			/*
			* Remplazar plath de ser necesario.
			*
			* Si detecta el parametro path es remplazado. En caso de ser String o RegExp
			*/
			if (_.has(routeConfig, "path")) {
				if (_.isRegExp(routeConfig.path) || _.isString(routeConfig.path)) {
					this.log("Is change Path", colors.magenta(RoutePath), "a", colors.magenta(routeConfig.path));
					RoutePath = routeConfig.path;
				}
			}


			// Static Directories
			if (RouteMethod == "static") {

				let arrPaths = _([]);

				if (_.isString(routeConfig)) {
					arrPaths.push(routeConfig);
				} else if (_.isArray(routeConfig) || _.isObject(routeConfig)) {
					_.map(routeConfig, (path) => {
						// logger.log(colors.green("Mapping:"), routeConfig, "Path:",path)
						this.log("Static Config:",routeConfig)
						this.log("Static Path:",path)
						arrPaths = arrPaths.push(path);
					} );
				}

				arrPaths
				.filter( _.isString )
				.map( (path) => {
					// logger.log("Load Static Path", colors.green(path), "in", colors.green(RoutePath));
					this.log("Load Static Path", colors.green(path), "in", colors.green(RoutePath));
					this.app.use(RoutePath, express.static(path));
				} )
				.run();
			} else
			// Filter Methods
			if (_.indexOf(methods, RouteMethod) == -1) {
				// Error No exist Path
				this.err(`Not fount method '${RouteMethod}'.`)
			} else {
				// Exists Method
				this.log(`Found MapRoute, Method: '${RouteMethod}', Path: '${RoutePath}'.`);

				// Group
				this.method(RouteMethod, RoutePath, routeConfig);
			}
		} );
	}

	/*
	* Mapea un methodo.
	*/
	method (method, pathName, action) {
		// Validate Action.
		let controller = _.get(action, "controller", []);
		let view = _.get(action, "view", false);
		let policies = _.get(action, "policies", []);

		if (!_.isArray(controller)) {
			controller = [controller];
		}

		controller = _.map(controller, (ctrl) => {
			if (_.isString(ctrl)) {
				return this.capjs.getController(ctrl);
			}
			return ctrl;
		});

		controller = _.filter(controller, _.isFunction);


		// Resolve Policies
		if (!_.isArray(policies)) {
			policies = [policies];
		}

		// If String Find Policie
		policies = _.map(policies, (policie) => {
			if (_.isString(policie)) {
				this.log("Load Policie:", colors.green(policie));
				return this.capjs.getPolicie(policie);
			}
			return policie;
		});



		// Control Policies
		if (policies.length > 0) {
			this.log("Load Policies", colors.green(policies.length),"in", colors.green(pathName), ".");


			this.app.all(pathName, (req, res, next) => {
				async.parallel(_.map(policies, (policie) => {
					return (cb) => {
						return policie(req, res, cb);
					};
				}), (err, resuls) => {
					if (err) {
						res.sendStatus(403);
					} else {
						next();
					}
				});
			});

			// 	if (this.resolvePolicies(policies, req, res) == true) {
			// 		return next();
			// 	} else {
			// 		return res.sendStatus(403);
			// 	}
			// });
		}






		if (controller.length > 0) {
			this.log(`Loading ${controller.length} Controller to ${pathName}.`);
			this.app[method](pathName, ...controller);
		}

		if (_.isString(view)) {
			this.log(`Loading View '${view}' to ${pathName}.`);
			this.app[method](pathName, (req, res, next) => {
				if (_.isFunction(res.view)) {
					res.view(view);
				} else {
					res.render(view, {});
				}
			});
		}
	}

	resolvePolicies (groupPolicies, req = {}, res = {}) {
		let isValid = true;

		if (_.isArray(groupPolicies) || _.isObject(groupPolicies)) {
			// Is a collect Policie
			_.map(groupPolicies, (policie) => {
				let resolve = this.resolvePolicies(policie, req, res);
				if (resolve == false) {
					isValid = false;
				}
			})
		} else {
			// Is Singular Policie
			let resolve = this.analizePolicie(groupPolicies, req, res);
			if (resolve == false) {
				isValid = false;
			}
		}

		return isValid;
	}

	analizePolicie (policie, req = {}, res = {}) {
		if (_.isFunction(policie)) {
			return Boolean(policie(req, res));
		}
		else {
			return Boolean(policie);
		}
	}
}


export default mapingRoutes;
