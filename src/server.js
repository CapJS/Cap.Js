/**
 * Run the server.
 */

import _ from "lodash";
import express from "express";
import logger from "./logger.js";
import Maping from "./mapingRoutes.js";
import capjs from "./cap.js";
import path from "path";
import colors from "colors/safe";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import SocketIO from "socket.io";
import http from "http";


export default class server {
	constructor ({
		port = 80,
		host = null,
		maping = null,
		middleware = {},
		orderMiddleware = [],
		behavior = {},
		orderBehavior = [],
		capjs = null,
	} = {}) {
		this.capjs = capjs;
		this.app = new express();
		this.server = http.createServer(this.app);
		this.port = port;
		this.host = host;
		this.behavior = behavior;
		this.orderBehavior = orderBehavior;
		this.middleware = middleware;
		this.orderMiddleware = orderMiddleware;

		// bodyParser
		this.app.use(bodyParser.urlencoded({ "extended": false }));
		this.app.use(bodyParser.json());

		// cookieParser
		this.app.use(cookieParser());

		// compression
		this.app.use(compression());

		// Implement SocketIO
		this.io = SocketIO();

		this.loadBehavior();
		this.loadMiddleware();
		this.maping = new Maping(this.app, {
			"maping": maping,
			"capjs": this.capjs,
		});
	}

	loadMiddleware() {
		_.map(this.orderMiddleware, (middlewareName) => {
			let middleware = _.get(this.middleware, middlewareName, false);

			if (middleware != false && _.isFunction(middleware)) {
				logger.info(`Load middleware ${colors.green(middlewareName)}.`);
				this.app.use(middleware);
			}
		});
	}

	loadBehavior() {
		_.map(this.orderBehavior, (behaviorName) => {
			let behavior = _.get(this.behavior, behaviorName, false);

			if (behavior != false && _.isFunction(behavior)) {
				logger.info(`Load behavior ${colors.green(behaviorName)}.`);
				behavior(this.app, this.capjs);
			}
		});
	}

	listen(...args) {
		// Degault PORT
		if (_.get(args, "[0]", false)===false) {
			_.set(args, "[0]", this.port);
		}

		// Default HOST
		if (_.get(args, "[1]", false)===false) {
			_.set(args, "[1]", this.host);
		}

		// Default backlog
		if (_.get(args, "[2]", false)===false) {
		}

		let listener = this.server.listen(...args, function (...argscb) {
			let callback = _.last(args);
			let address = listener.address();

			let urlGo = () => {
				let hostname = address.address;
				let port = address.port;

				if (address.address == "0.0.0.0") {
					hostname = "127.0.0.1";
				} else if (address.address == "::") {
					hostname = "[::1]";
				}
				// return `http://localhost:${port}`;
				return `http://${hostname}:${port}`;
			};

			logger.alert(`opened server on host [${address.address}], port ${address.port}. Url ${urlGo()} .`);

			if (_.isFunction(callback)) {
				callback(...argscb);
			}
		});

		return listener;
	}

	all(...args) {return this.app.all(...args);}
	delete(...args) {return this.app.delete(...args);}
	disable(...args) {return this.app.disable(...args);}
	disabled(...args) {return this.app.disabled(...args);}
	enable(...args) {return this.app.enable(...args);}
	enabled(...args) {return this.app.enabled(...args);}
	engine(...args) {return this.app.engine(...args);}
	get(...args) {return this.app.get(...args);}
	get(...args) {return this.app.get(...args);}
	METHOD(...args) {return this.app.METHOD(...args);}
	param(...args) {return this.app.param(...args);}
	path(...args) {return this.app.path(...args);}
	post(...args) {return this.app.post(...args);}
	put(...args) {return this.app.put(...args);}
	render(...args) {return this.app.render(...args);}
	route(...args) {return this.app.route(...args);}
	set(...args) {return this.app.set(...args);}
	use(...args) {return this.app.use(...args);}

}
