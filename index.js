
const Path = require("path");
const Antena = require("antena/node");
const ChildProcess = require("child_process");
const Melf = require("melf");
const MelfShare = require("melf-share")
const TrapTypes = require("./trap-types.js");

module.exports = (analysis, options, callback) => {
  const child = ChildProcess.fork(Path.join(__dirname, "child-melf-server.js"), [
    "--port", options["port"],
    "--node-port", options["node-port"],
    "--browser-port", options["browser-port"],
    "--ca-home", options["ca-home"],
    "--url-search-prefix", options["url-search-prefix"],
  ]);
  child.on("message", () => {
    Melf(new Antena(options["node-port"]||options["port"]), "aran-remote", (error, melf) => {
      if (error)
        return callback(error);
      const share = MelfShare(melf, {sync:true});
      const aran = Aran();
      const remotes = {};
      const make_remote = analysis(aran, share);
      melf.rprocedures["aran-remote-initialize"] = (origin, data, callback) => {
        remotes[origin] = make_remote(share.instantiate(data[0]), data[1]);
        remotes[origin].pointcut = remotes[origin].pointcut || Object.keys(remotes[origin].advice).filter(islower);
        callback(null, {
          namespace: aran.namespace,
          setup: Astring.generate(aran.setup()),
          sandbox: share.serialize(remotes[origin].advice.SANDBOX)
        });
      };
      melf.rprocedures["aran-remote-transform"] = (origin, data, callback) => {
        const estree = remotes[origin].parse(data[0]);
        if (estree) {
          callback(null, Astring.generate(aran.weave(estree, remotes[origin].pointcut, /^https?\:\/\//.test(source) ? "global" : "node")));
        } else {
          callback(null, data[0]);
        }
        callback(null, aran.weave(transform(data[0], data[1], advices[origin]));
      };
      Object.keys(TrapTypes).forEach((name) => {
        const hint = name === "begin" || "arrival" ? {} : "*";
        // if (options.sync) {
          melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => {
            try {
              callback(null, share.serialize(advices[origin].advice[name].apply(null, share.instantiate(data, TrapTypes[name])), hint));
            } catch (error) {
              callback(error);
            }
          };
        // } else {
        //   melf.rprocedures["aran-remote-"+name] = (origin, data, callback) => {
        //     advices[origin][name].apply(null, share.instantiate(data, TrapTypes[name])).catch(callback).then((result) => {
        //       callback(null, share.serialize(result, hint));
        //     });
        //   };
        // }
      });
      callback(null, share.ownerof);
    });
  });
};