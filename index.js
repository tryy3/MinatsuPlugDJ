var PlugAPI = require('plugapi');
var fs = require('fs');
var _ = require('underscore');
var DataStore = require('nedb');
var test;

var CONFIG = require('./config.json');
var plugins = new DataStore(
{
    inMemoryOnly: true,
    autoload: true
})

new PlugAPI(
{
    "email": CONFIG.Email,
    "password": CONFIG.Password
}, function(minatsu)
{
    var bot = minatsu;
    var reconnect = function()
    {
        minatsu.connect(CONFIG.Room);
    }
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
            console.log("Plug.DJ: " + data.from + " => " + data.message);
        }
    })

    minatsu.on('error', reconnect)
    minatsu.on('close', reconnect)
});

var loadPlugins = function(cb)
{
    fs.readdir(CONFIG.ScriptFolder, function(err, files)
    {
        if (err) throw err;

        files.forEach(function(v, j)
        {
            var reg = /.+(\.js)$/m

            if (reg.test(v))
            {
                var pl = require(CONFIG.ScriptFolder + "/" + v);
                var pl_keys = _.keys(pl);

                pl_keys.forEach(function(name, key)
                {
                    var cpl = pl[name];
                    console.log(cpl);
                    plugins.insert(pl, function(err, newdoc)
                    {
                        plugins.find(
                        {}, function(err, docs)
                        {
                            console.log(docs);
                        })
                    })
                })
            }
        })
    })
}

loadPlugins();