'use strict';

var urlparse = require('url').parse;

exports.name = 'init';
exports.usage = '<command> [options]';
exports.desc = 'A awesome scaffold of gfe';

var templates = require('./config/scaffold.js');
var fs = require('fs');
var path = require('path');

exports.register = function(commander) {
    fis.util.map(templates, function(key, info) {
        commander
            .command(key)
            .description(info.desc);
    });

    commander.action(function() {
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var template = args.shift();

        if (!template) {
            commander.outputHelp();
            return;
        }

        template = template.split('@');

        var version = template.length === 2 ? template[1] : 'master';
        var name = template[0];
        var conf = templates[name];

        if (!conf) {
            fis.log.error('invalid init command, see -h');
        }

        var dir = process.cwd();

        var scaffold = new(require('fis-scaffold-kernel'))({
            type: conf.config.type,
            log: {
                level: 4 // default show all log; set `0` == silent.
            }
        });
        fis.log.notice('Downloading and unzipping...');
        var keyword_reg = /\{\{-([\s\S]*?)-\}\}/ig;
        scaffold.download(conf.config.repos + '@' + version, function(err, tmp_path) {
            if (err) {
                fis.log.error(err);
            }
            deploy(tmp_path);
        });

        function deploy(templatePath) {
            var source_path = path.join(templatePath, conf.config.path || '');
            var script = path.join(source_path, '.scaffold.js');
            var prompt = null;
            try {
                var scaffoldConf = require(script);
                if (scaffoldConf.prompt) {
                    prompt = scaffoldConf.prompt;
                }
                scaffold.util.del(script);
            } catch (e) {}

            var files = scaffold.util.find(source_path);
            scaffold.prompt(prompt || conf.config.prompt, function(err, results) {
                if (err) {
                    fis.log.error(err);
                }
                if (conf.config.property) {
                    conf.config.property.forEach(function(property) {
                        results[property.name] = property.calc(results[property.from]);
                    });
                }
                results._namespace = fis.config.get('namespace');
                fis.util.map(results, function(k, v) {
                    fis.util.map(files, function(index, filepath) {
                        if (fs.lstatSync(filepath).isSymbolicLink() === false && fis.util.isTextFile(
                                filepath)) {
                            var content = fis.util.fs.readFileSync(filepath, {
                                encoding: 'utf8'
                            });
                            content = content.replace(keyword_reg, function(m, $1) {
                                if ($1 === k) {
                                    m = v;
                                }
                                return m;
                            });
                            fis.util.fs.writeFileSync(filepath, content);
                        }
                    });
                });

                conf.config.roadmap.forEach(function(ruler) {
                    fis.util.map(results, function(k, v) {
                        ruler.release = ruler.release.replace(new RegExp('\\$\\{' + k + '\\}', 'g'), v);
                    });
                });
                scaffold.deliver(source_path, dir, conf.config.roadmap);
                fis.log.notice(conf.type + ' init done!');
            });
        }
    });
};
