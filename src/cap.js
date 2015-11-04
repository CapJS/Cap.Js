/**
 * Gestiona el framework como modulo.
 */

import server from "./server.js";
import path from "path";
import _ from "lodash";
import cluster from "./cluster.js";
import Cluster from "cluster";
import fs from "fs";
import logger from "./logger.js";
import express from "express";
import colors from "colors/safe";
import i18n from "i18n";
import compression from "compression";
import bodyParser from "body-parser";


class capjs {
  constructor({
    chdir = process.cwd(),
    config = [],
    loadenv = true,
    disableResponses = false,
    controller = {},
    policies = {},
  } = {}) {
    if (_.isArray(controller)) {
      controller = controller;
    } else {
      controller = [controller];
    }
    this.controller = controller;

    if (_.isArray(policies)) {
      policies = policies;
    } else {
      policies = [policies];
    }
    this.policies = policies;

    // bodyParser
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());

    // compression
    this.app.use(compression());

    // CHDIR Definido.
    this.chdir = chdir;
    this._config = _({});
    this.resolveConfig(config);
    this.setConfig("paths.chdir", this.chdir);
    this.loadenv = loadenv;

    this.disableResponses = disableResponses;

    this.log = logger;


    // Package path
    this.package_path = this.pathResolve("package.json")
    // Load Package
    this.package = (fs.existsSync(this.package_path)) ? require(this.package_path): {};

    // Configure Base CapJS
    this.loadConfigs();

    this.appService = null;

    // Configure i18n
    let configi18n = this.config("i18n");
    i18n.configure(configi18n);
    this.i18n = i18n;
  }

  setConfig (...args) {
    this._config = this._config.set(...args);
    return this;
  }


  /*
  * Load Controller by File or preload config
  */
  getController (pathname) {
    // return this.controller;
    return _.get(_.find(this.controller, pathname), pathname);
  }

  getPolicie (pathname) {
    return _.get(_.find(this.policies, pathname), pathname);
  }

  _loadEngineBySetting (app) {
    // Seting Engine
    let views = this.config("views", false);
    let view_engine = this.config("views.engine", false);
    let view_views = this.pathResolve(this.config("views.views", "app/views"));
    let view_engine_ext = this.config("views.engine.ext", false);
    let view_engine_callback = this.config("views.engine.callback", false);


    if (views == false || view_engine == false || view_engine_ext == false || view_engine_callback == false) {
      logger.warn("Skips 'views' setting.");

      if (view_engine != false) {
        if (view_engine_ext == false) {
          logger.error("Is not defined the 'views.engine.ext' setting.");
        }
        if (view_engine_callback == false) {
          logger.error("Is not defined the 'views.engine.callback' setting.");
        }
      } else {
        logger.error("Is not defined the 'views.engine' setting.");
      }
    } else {
      logger.info(`Is loading view Engine with extension '${view_engine_ext}'.`);

      if (view_views != false) {
        if (fs.existsSync(view_views)) {
          app.set("views", view_views);
          app.set('view engine', view_engine_ext);
        } else {
          logger.error(`Not exists folder '${view_views}'. Skip load folder.`)
        }
      }

      app.engine(view_engine_ext, view_engine_callback);
    }
  }

  /*
  * Crea el Servidor.
  */
  createServerApp () {
    // Load Server
    logger.deb("Is Create the App Service.");


    // Bootstrap Obtion
    let _local_bootstrap = this.config("bootstrap");
    if (_.isFunction(_local_bootstrap)) {
      _local_bootstrap(this);
    }



    let behaviorApp = this.config("http.behavior", {});
    let middlewareApp = this.config("http.middleware", {});

    if (this.config("http.middleware.resView", false) === false) {
      middlewareApp["resView"] = require(path.resolve(__dirname, "responses", "view.js"));
    }


    // Locals middlewareApp
    middlewareApp["capjs_reqCapJSVar"] = (req, res, next) => {
      req.capjs = this;
      return next();
    }

    let middlewareAppLocalOrder = [
      "capjs_reqCapJSVar",
    ];


    // Create Server Express
    let app = new server({
      "capjs": this,
      "maping": this.config("routes", null),
      "behavior": behaviorApp,
      "orderBehavior": this.config("http.behavior.order", [
      ]),
      "middleware": middlewareApp,
      "orderMiddleware": [...middlewareAppLocalOrder, ...this.config("http.middleware.order", [
              "resView",
            ])],
    });

    this._loadEngineBySetting(app);

    app.listen();
  }




  /*
  * Resolve Config
  * Geneara las configuraciones a partir de un objeto o arreglos.
  */
  resolveConfig (objectConfig) {
    if (_.isArray(objectConfig)) {
      // Map Array
      _.map(objectConfig, (valueConfig) => {
        this.resolveConfig(valueConfig);
      });
    } else {
      // Map Object
      _.map(objectConfig, (value, name) => {
        this.setConfig(name, value);
      });
    }
    return this;
  }



  /**
  * Obtiene la configuración del sistema. Asociada al scope.
  *
  * Syntax:
  *   capjs.config([key_name_config[, default]])
  *
  * Ex.
  *   this.config("configname", true)
  */
  config (_key = undefined, _default = undefined) {
    if (_key) {
      return this._config.get(_key, _default);
    } else {
      return this._config.value();
    }
  }

  /*
  * Carga todos los archivos '.js' de un directorio y retorna un objeto con todos los archivos cargados.
  * Ejemplo:
  *
  * Directorio:
  *   configs/
  *       - app.js
  *         ```javascript
  *         module.exports.app = {"name": "app"}
  *         ```
  *
  * Node:
  * > capjs.readdir("configs/")
  * {
  *   "app": {
  *     "name": "app"
  *   }
  * }
  */
  static readdir (dirpath, {
    /* Si es `true` tomara como nombre de la propiedad el nombre de archivo */
    autokey = false,
    objectCombined = false,
  } = {}) {
    let filesConfigs = _(fs.readdirSync(dirpath));
    let _local_config = _({});


    let configs = filesConfigs
      .filter((file) => /\.js$/.exec(file))
      .map((file) => path.resolve(dirpath, file))
      .map((file) => {return {file, body: require(file)}})
      .map((confg, k) => {
        if (autokey == false) {
          _.map(confg.body, (conf, key) => {
            _local_config = _local_config.set(key, conf);
            return conf
          });
        } else {
          _local_config = _local_config.set(path.basename(confg.file, ".js"), confg.body);
        }

        return confg;
      }).value();

    return _local_config.value();
  }

  scanEnv () {
    // Load config by Environment.
    _.map(process.env, (value, name) => {
      let match = (new RegExp("^CAPJS_([_|a-z|0-9]+)","i")).exec(name);
      if (match) {
        this.setConfig(match[1].split("_").join(".").toLowerCase(), value);
      }
    })

    // Load config by Environment segun el nombre de la plicación.
    if (this.package.name) {
      _.map(process.env, (value, name) => {
        let match = (new RegExp(`^${this.package.name}_([_|a-z|0-9]+)`,"i")).exec(name);
        if (match) {
          this.setConfig(match[1].split("_").join(".").toLowerCase(), value);
        }
      })
    }
    return this;
  }

  /**
  * Carga las configuraciones segun el directorio del directorio de trabajo.
  */
  loadConfigs () {
    if (this.loadenv == true) {
      this.scanEnv();
    }

    return this;
  }

  /*
  * Adjuntoa un complemento hijo al padre.
  */
  // attach (path, child) {
  //   this.attached.set(path, child);
  // }

  // Retronar un pash basado en la ruta de este modulo capjs.
  pathResolve (...paths) {
    return path.resolve(this.chdir, ...paths);
  }

  /**
  * Listen all servers.
  * Crea un servidor.
  */
  listen () {
    let EnableMultiCluster = this.config("cluster.enable", false);

    new cluster({
      "process": () => {
        this.createServerApp();
      },
      "relieve": this.config("cluster.relieve", true),
      "numcpus": (EnableMultiCluster == false) ? 1 : this.config("cluster.numcpus", null),
      "maxcpus": (EnableMultiCluster == false) ? null : this.config("cluster.maxcpus", null),
    })
    .loadClusters()
    .listen();
  }
}

capjs.logger = logger;
capjs.lodash = _;
capjs.i18n = i18n;


module.exports = capjs;

