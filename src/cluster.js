import _ from "lodash";
import os from "os";
import Cluster from "cluster";
import express from "express";
import logger from "./logger.js";
import server from "./server.js";

// let _ = require('lodash');
// let os = require('os');
// let Cluster = require('cluster');
// let express = require('express');

class cluster {
	constructor ({
		relieve = true,
		maxcpus = null,
		numcpus = null,
		process:_process = function () {},
	} = {}) {
    this.relieve = relieve;
    this.maxcpus = maxcpus;
    this.numcpus = numcpus;

    // Funcion a cargar.
    this.process = _process;

		if (this.maxcpus == null || this.maxcpus == "null" || this.maxcpus == "auto") {
			this.maxcpus = os.cpus().length;
		}
	}

	/**
	* Carga los Cluster.
	*/
	loadClusters () {
		if (Cluster.isMaster) {
			let nclusters = (this.numcpus == null || this.numcpus == "null" || this.numcpus == "auto") ? this.maxcpus : this.numcpus;

			for	(let i = 0; i < nclusters; i++) {
				Cluster.fork();
			}
		} else if (Cluster.isWorker) {
			logger.deb(`Load Cluster Worker #${Cluster.worker.id}`);
			// console.log("Load Cluster Worker");
			if (typeof(this.process) == "function") {
				this.process();
			}
		}

		return this;
	}

	killAll () {}

	/*
	* Get a workers of cluster.
	*
	* Syntax:
	*		cluster.get(idCluster)
 	*/
 	get(idCluster) {
		if (Cluster.isMaster) {
			return Cluster.workers[idCluster];
		} else {
			return false;
		}
 	}

 	/*
 	* Get all Workers.
 	* Sytax:
 	*		cluster.all()
 	*/
 	all() {
		if (Cluster.isMaster) {
			return Cluster.workers;
 		} else {
 			return false;
 		}
 	}

	/*
	* Abre un servidor para el manejo de los servidores activos.
	*/
	listen () {
		if (Cluster.isMaster) {
			let app = new server({
				port: 32020,
			});
			let clusterRoute = express.Router();
			let workerClusteRoute = express.Router();

			clusterRoute.get('/', (req, res, next) => {
				let status = "ok";
				let servers = _.map(this.all(), function (worker, workerId) {
					return {
						id: workerId,
						pid: worker.process.pid,
						state: worker.state,
					}
				});

				res.json({
					status,
					servers,
				});
			});

			clusterRoute.get('/fork', (req, res, next) => {
				let status = false;
				let worker = {};
				let resJson = {};

				try {
					worker = Cluster.fork();
					resJson = {
						status: "success",
						pid: worker.process.pid,
						state: worker.state,
					};
					return res.json(resJson);
				} catch (ex) {
					logger.error(ex);
					status = false;
					resJson = {
						status: "error",
					};
					return res.json(resJson, 500);
				}
			});

			workerClusteRoute.all("/:idCluster*",(req, res, next) => {
				let worker = this.get(req.params.idCluster);
				if (worker) {
					req.worker = worker;
					next();
				} else {
					res.json({}, 404);
				}
			});

			workerClusteRoute.get("/:idCluster", (req, res, next) => {
				res.json({
					pid: req.worker.process.pid,
					state: req.worker.state,
				});
			});

			let deleteWorker = (req, res, next) => {
				try {
					let pidRemove = req.worker.process.pid;
					req.worker.kill();
					// console.log(req.worker);
					res.json({
						"state": "killing",
						"pid": pidRemove,
						"message": `Has kill worker ${pidRemove}`,
					}, 200);
				} catch (ex) {
					logger.error(ex);
					res.json({}, 500);
				}
			}

			workerClusteRoute.post("/:idCluster/delete", deleteWorker);
			workerClusteRoute.delete("/:idCluster", deleteWorker);

			clusterRoute.use(workerClusteRoute);
			app.use("/cluster", clusterRoute);

			let listener = app.listen();
		}
	}
}

module.exports = cluster;
