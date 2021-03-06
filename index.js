var PlugAPI = require('plugapi');
var fs = require('fs');
var _ = require('underscore');
var DataStore = require('nedb');

var pluginFunctions = {};

var CONFIG = require('./config.json');
var plugins = new DataStore(
{
    inMemoryOnly: true,
    autoload: true
});

new PlugAPI(
{
    "email": CONFIG.Email,
    "password": CONFIG.Password
}, function(minatsu)
{
    var reconnect = function()
    {
        minatsu.connect(CONFIG.Room);
    };
    minatsu.connect(CONFIG.Room);

    minatsu.on('roomJoin', function(room)
    {
        console.log("Minatsu connected to " + room);
    });

    minatsu.on('chat', function(data)
    {
        if (data.type == 'emote')
        {
            console.log(data.from + data.message);
        }
        else
        {
            var argsReg = {};
            var reg = new RegExp("^" + CONFIG.CommandPrefix + "(.+)", "m");
            if (argsReg = reg.exec(data.message))
            {
                var argsSplit = argsReg[1].split(' ');
                var args = [];
                args[0] = data.message;
                args[1] = [];
                args[1][0] = data.raw.un;
                args[1][1] = data.raw.uid;
                args[2] = argsSplit[0];
                argsSplit.shift();
                args[3] = argsSplit.length <= 0 ? null : argsSplit;

                plugins.find(
                {
                    $or: [
                        {
                            cmd: args[2]
                        },
                        {
                            aliases: args[2]
                        }
                    ]
                }, function(err, docs)
                {
                    if (err) throw err;
                    if (docs.length > 1)
                    {
                        //Too many commands found!
                    }
                    else if (docs.length < 1)
                    {
                        //Command is not found!
                    }
                    else
                    {
                        pluginFunctions[docs[0]._id](args);
                    }
                });
            }
            console.log("Plug.DJ: " + data.from + " => " + data.message);
        }
    });

    minatsu.on('error', reconnect);
    minatsu.on('close', reconnect);
});

var loadPlugins = function(cb)
{
    fs.readdir(CONFIG.ScriptFolder, function(err, files)
    {
        if (err) throw err;

        files.forEach(function(v, j)
        {
            var reg = /.+(\.js)$/m;

            if (reg.test(v))
            {
                var pl = require(CONFIG.ScriptFolder + "/" + v);
                var pl_keys = _.keys(pl);

                pl_keys.forEach(function(name, key)
                {
                    var cpl = pl[name];
                    var func = cpl.function;
                    delete cpl.function;
                    plugins.insert(pl, function(err, newdoc)
                    {
                        if (err) throw err;
                        pluginFunctions[newdoc[0]._id] = func;
                    });
                });
            }
        });
    });
};

loadPlugins();