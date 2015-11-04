// var server = require("./lib/server.js");
var capjs = require("./lib/cap.js");


/**
 * Inicializa el servicio.
 */
module.exports = function CapMaster () {
  if (this instanceof CapMaster) {
    // If using NEW
  } else {
    // return new
  }
	for (var _len = arguments.length, _e = Array(_len), _key = 0; _key < _len; _key++) {
    _e[_key] = arguments[_key];
  }

  let _LOCAL_CAPJS = new (Function.prototype.bind.apply(capjs, [null].concat(_e)))();
	return _LOCAL_CAPJS;

  // if (_LOCAL_CAPJS.config("globals.capjs", false)) {
  //   GLOBAL.capjs = _LOCAL_CAPJS;
  //   return GLOBAL.capjs;
  // } else {
  // }
}


module.exports.capjs = capjs;
module.exports.readdir = capjs.readdir;

