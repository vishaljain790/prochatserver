"use strict";
var app = require('express')();
var https = require('https');
var fs = require('fs');

var mysql = require('mysql');
var uuid = require('uuid');
var path = require('path');
var formidable = require('formidable');

// var options = {

//     key: fs.readFileSync('m6cliq.info.key'),
//     cert: fs.readFileSync('m6cliq.info.chain.crt')

// };
app.use(function(req, res, next) {


    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});





var users = {};
var server = https.createServer(app);


var wss = require('socket.io')(server);



//prochat db
var connectionprochat = mysql.createConnection({

    host: 'testdbinstance.cqx8hkhz2f8t.us-west-2.rds.amazonaws.com',
    user: 'testuser',
    password: 'testuser1',
    database: 'prochatnode'
});

connectionprochat.connect(function(error) {
    if (!!error) {
        console.log('ERROR');
    } else {
        console.log('CONNECTED');
    }
});
//prochat db









wss.on('connection', function(connection) {

    console.log(new Date() + " User connected" + connection);

    var online = "1";
    var sid = connection.id;
    var objval;
    console.log("this connection....>>>");



    //when user exits, for example closes a browser window 
    //this may help if we are still in "offer","answer" or "candidate" state 
    connection.on("disconnect", function() {
        console.log(new Date() + " deleting.........." + connection.name + connection + users[connection.name]);
        if (connection.name) {
            var conn = users[connection.name];
            // conn.otherName = null;
            console.log("conn name:-" + conn);
            if (conn != null) {
                sendTo(conn, {
                    type: "leave"
                });
            }

            delete users[connection.name];

        }

        console.log("disconnecting:- " + sid);
        connectionprochat.query("UPDATE userinfo SET onlinestatus=" + "2" + " WHERE socketid='" + sid + "'", function(err, result) {

            if (!!err) {
                console.log(err);

            } else {


            }
        });

    });

    connection.on("connectionsetup", function(uservalue) {

        var cnctnsetup;
        console.log(uservalue + "////");
        //accepting only JSON messages 
        try {
            cnctnsetup = JSON.parse(uservalue);
        } catch (e) {
            console.log("Invalid JSON");
            cnctnsetup = {};
        }



        //save user connection on the server 
        users[cnctnsetup.name] = connection;
        connection.name = cnctnsetup.name;
        console.log("entry done in ELSE" + connection + "////" + cnctnsetup.name);


        console.log("further connection details:-" + users[cnctnsetup.name]);
    });



    // connection.send("Hello world");  





    //prochat calling emitters
    connection.on('usernamesubmit', function(msg) {
        try {
            objval = JSON.parse(msg);
            connectionprochat.query("INSERT INTO userinfo (`username`,`onlinestatus` ,`socketid`) VALUES(" + mysql.escape(objval.username) + "," + "1" + "," + mysql.escape(sid) + ") ON DUPLICATE KEY UPDATE socketid=" + mysql.escape(sid) + ",onlinestatus=" + "1", function(err, result) {
                if (!!err) {
                    console.log(err);
                    connection.emit('connectionstatus', "0");

                } else {
                    connection.emit('connectionstatus', "1");
                }
            });
        } catch (error) {
            console.log(error);
        }


    });


    connection.on('groupacctogrouptype', function(data, fn) {

        var myobj = JSON.parse(data);
        var companyid = parseInt(myobj.companyid);
        var grouptype = myobj.grouptype;
        var username = myobj.username;


        var query = connectionprochat.query("select groupid, groupname from groupinfo where grouptype=" + mysql.escape(grouptype) + " AND companyid = '" + companyid + "' AND username = " + mysql.escape(username), function(err, result) {

            if (!!err) {

                console.log(query.sql + err);
            } else {

                console.log("forgrouptype" + result + "/////" + query.sql);
                fn(JSON.stringify(result));

            }

        });



    });


    connection.on("typingstatus", function(data) {

        var obj = JSON.parse(data);

        var fromuname = obj.fromusername;
        var touname = obj.tousername;
        var typestatus = parseInt(obj.status);


        var query = connectionprochat.query("SELECT socketid from userinfo where username=" + mysql.escape(touname), function(err, result) {

            if (!!err) {

                console.log(query.sql + err + "in typingstatus");


            } else {

                console.log(query.sql + "done");
                connection.broadcast.to(result[0].socketid).emit('checktypingstatus', typestatus);

            }

        });


    });



    connection.on('sendmessage', function(datavalmsg, fn) {

        console.log("send msg json:-" + datavalmsg);

        var objmsg = JSON.parse(datavalmsg);
        var fromusername = objmsg.fromusername;
        var tousername = objmsg.tousername;
        var togroupid = parseInt(objmsg.togroupid);
        var togroupname = objmsg.togroupname;
        var msgval = objmsg.message;
        var filestatus = parseInt(objmsg.isfile);
        // var checkstatus = connection.query("")		


        var query = connectionprochat.query("SELECT socketid from userinfo where username=" + mysql.escape(tousername) + " AND onlinestatus='" + "yes" + "'", function(err, result) {

            console.log("data row:-" + result.length);
            if (!!err) {
                fn("0");

                console.log(query.sql + err);
            } else if (result.length == 0) {


                var querytoinsert = connectionprochat.query("INSERT into chatinfo (`fromusername`,`tousername`,`togroupid`,`togroupname`,`message`,`isfile`) VALUES (" + mysql.escape(fromusername) + "," + mysql.escape(tousername) + "," + "'" + togroupid + "'" + "," + mysql.escape(togroupname) + "," + mysql.escape(msgval) + "," + "'" + filestatus + "'" + ")", function(err, result1) {

                    if (!!err) {
                        fn("0");
                        console.log("insert query:-" + querytoinsert.sql);
                        console.log("error 1:-" + err);
                    } else {
                        fn("1");
                        console.log("insertted successfullt inyo 1st block");

                        //			socket.broadcast.to(result[0].socketid).emit('message', msg);
                    }



                });


            } else {
                //  		console.log(query.sql+result[0].socketid);     
                //      socket.broadcast.to(result[0].socketid).emit('message', msg);



                var querytoinsert = connectionprochat.query("INSERT into chatinfo (`fromusername`,`tousername`,`togroupid`,`togroupname`,`message`,`isfile`) VALUES (" + mysql.escape(fromusername) + "," + mysql.escape(tousername) + "," + mysql.escape(togroupid) + "," + mysql.escape(togroupname) + "," + mysql.escape(msgval) + "," + "'" + filestatus + "'" + ")", function(err, result1) {

                    if (!!err) {

                        fn("0");
                        console.log("error 2:-" + err);
                    } else {

                        fn("2");
                        console.log("inserted in chat table using 2 block");
                        connection.broadcast.to(result[0].socketid).emit('message', msgval, Date.now());
                    }



                });

            }

        });

    });



    connection.on("sendingmessgaelist", function(data, fn) {


        var obj = JSON.parse(data);
        var fromusername = obj.fromusername;
        var tousername = obj.tousername;
        var togroupid = parseInt(obj.groupid);
        var fromid = parseInt(obj.lastchatid);


        if (fromid == 0) {

            var query = connectionprochat.query("select *  from chatinfo where fromusername IN ('" + fromusername + "','" + tousername + "')" + " AND tousername IN ( '" + tousername + "','" + fromusername + "')" + " AND togroupid='" + togroupid + "'" + " ORDER BY chatid DESC LIMIT 100", function(err, result) {

                if (!!err) {

                    fn("0");
                    console.log(query.sql + err);

                } else {

                    console.log("successfully sent on the client side!!" + query.sql);
                    fn(JSON.stringify(result));
                }

            });



        } else {

        }




    });


    connection.on('groupdetail', function(data_val, fn) {

        console.log("details:-" + data_val);
        var dataobj = JSON.parse(data_val);

        //      var groupid =  dataobj.group_id;
        var groupname = dataobj.group_name;
        var groupparent = dataobj.group_parent;
        var grouptype = dataobj.group_type;
        var companyid = dataobj.group_companyid;
        var authorname = dataobj.group_author;

        var query = connectionprochat.query("INSERT INTO groupinfo (`groupname`,`groupparent`,`grouptype`,`companyid`, `username`,`groupauthor`) VALUES (" + mysql.escape(groupname) + "," + mysql.escape(groupparent) + "," + mysql.escape(grouptype) + "," + mysql.escape(companyid) + "," + mysql.escape(authorname) + "," + mysql.escape(authorname) + ")", function(err, result) {


            if (!!err) {

                fn("0");
                console.log(query.sql);
                console.log(err);
            } else {
                fn(result.insertId);
                //          console.log("successfully insrted group details");
                //	var query2 = connection.query("SELECT groupid from g")





            }

        });

    });


    connection.on('getgroupdetails', function(data, fn) {

        console.log("getting group detilas:-" + data);

        var query = connectionprochat.query("select * from groupinfo where groupid IN (select groupid from groupuser where username='" + data + "')", function(err, result) {

            console.log(query.sql);
            if (!!err) {

                console.log(err);
                fn("0");
            } else {

                fn(JSON.stringify(result));

            }

        });

    });


    connection.on("getgroupusersdetails", function(data, fn) {


        var obj = JSON.parse(data);

        var groupid = obj.group_id;
        var groupname = obj.group_name;
        var groupidval = parseInt(groupid);


        var query = connectionprochat.query("select * from userinfo LEFT JOIN groupuser ON userinfo.username = groupuser.username where groupid='" + groupidval + "'AND groupname=" + mysql.escape(groupname), function(err, result) {


            if (!!err) {
                console.log(err);
                fn("0");
            } else {

                console.log(result);
                fn(JSON.stringify(result));
            }


        });


    });

    connection.on('addfriendtoagroup', function(msg, fn) {


        var dataobj = JSON.parse(msg);
        console.log(dataobj);
        var groupid = dataobj.group_id;
        var groupname = dataobj.group_name;
        var frienduname = dataobj.friend_username;
        var companyid_group = dataobj.group_companyid;
        console.log("total user length:-" + dataobj.friend_username.length);
        for (var i = 0; i < dataobj.friend_username.length; i++) {
            addingfriend(groupid, dataobj.friend_username[i], companyid_group, groupname, fn);
        }

    });

    //prochat calling emitters


});




function messaginBroadcast(tonameval, socket) {


    //      var tonameval = touname[i]+"_broadcast";
    var query = connectionChat.query("SELECT socketid from userinfo where username=" + "'" + tonameval + "'", function(err, result) {

        if (!!err) {

            console.log(query.sql + err + "in messageservice");


        } else {

            console.log(query.sql + "done");
            socket.broadcast.to(result[0].socketid).emit('gettingMessageService');

        }

    });



}



//prochat function

function addingfriend(groupid, newuser, companyid_group, groupname, fn) {

    var query1 = connectionprochat.query("select count(*) AS totalrows from userinfo where username=" + mysql.escape(newuser), function(err, rows) {
        if (!!err) {

            fn("0");
            console.log(err);
        } else if (rows[0].totalrows == '0') {
            console.log("///");
            var query = connectionprochat.query("INSERT INTO userinfo (`username`) VALUES (" + mysql.escape(newuser) + ")", function(err1, result1) {
                if (!!err1) {
                    fn("0");
                    console.log(query.sql + err);
                } else {
                    fn("1");
                    console.log("successfully insrted group friend details");
                    var query = connectionprochat.query("INSERT INTO groupuser (`companyid`,`username`,`groupid`,`groupname`) VALUES (" + mysql.escape(companyid_group) + "," + mysql.escape(newuser) + "," + mysql.escape(groupid) + "," + mysql.escape(groupname) + ")", function(err2, result2) {

                        if (!!err2) {
                            fn("0");
                            console.log(query.sql + err);
                        } else {
                            fn("1");
                            console.log("successfully insrted group friend details");
                        }

                    });
                }
            });
        } else {

            var query = connectionprochat.query("INSERT INTO groupuser (`companyid`,`username`,`groupid`,`groupname`) VALUES (" + mysql.escape(companyid_group) + "," + mysql.escape(newuser) + "," + mysql.escape(groupid) + "," + mysql.escape(groupname) + ")", function(err, result) {

                if (!!err) {
                    fn("0");
                    console.log(query.sql + err);
                } else {
                    fn("1");
                    console.log("successfully insrted group friend details");
                }

            });

        }
    });

}
//prochat function

function sendTo(connection, message) {
    connection.emit('tuning', JSON.stringify(message));
}
