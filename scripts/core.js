var exports = module.exports = []

exports.push(
{
    "name": "Say Something",
    "cmd": "say",
    "aliases": ["tell", "s"],
    "permission": "Manager",
    "usage": "<cmd> (message)",
    "help": "Makes the bot repeat what you say",
    "function": function(args)
    {
        say(args[1]);
    }
})