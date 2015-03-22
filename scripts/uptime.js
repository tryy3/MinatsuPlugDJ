var exports = module.exports = []

exports.push(
{
    "name": "Uptime",
    "cmd": "uptime",
    "aliases": ["up", "online"],
    "permission": "Manager",
    "usage": "<cmd>",
    "help": "Shows the uptime of the bot.",
    "function": function(args)
    {
        uptime();
    }
});