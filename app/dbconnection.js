var mysql = require("mysql");

var connection = mysql.createConnection({

    host : "localhost",
    user : "root",
    password : "root",
    database : "prochat"
    
});

module.exports = connection;
