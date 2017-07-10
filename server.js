var express     =  require('express'),
    app         =  express();
    cors        =  require('cors');
    connectiontodb = require('./app/dbconnection.js');
    mysql          = require('mysql');
    //TO HANDLE POST REQUEST WITH JSON     
    bodyParser  =  require('body-parser');
    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());
    //TO HANDLE POST REQUEST WITH JSON

    require('./app/routes/routes')(app);

    var server = require('http').Server(app);  

    


    var wss = require('socket.io')(server);

    wss.on('connection', function(connection) {

    console.log(new Date() + " User connected" + connection);
    var sid = connection.id;


        connection.on('usernamesubmit', function(msg,callback) {
                try {
                    objval = msg;
                    console.log("///"+ objval.username+ "//"+ objval.name);
                   
                  var queryval =  connectiontodb.query("INSERT INTO service (`username`,`name` ,`socketid`,`status`) VALUES(" + mysql.escape(objval.username) + "," + mysql.escape(objval.name) + "," + mysql.escape(sid) + ","+"'"+"active"+"'"+") ON DUPLICATE KEY UPDATE socketid=" + mysql.escape(sid)+","+ "status='"+"active"+"'"  , function(err, result) {
                        if (!!err) {
                            console.log(err+ "////"+queryval.sql);
                            //connection.emit('connectionstatus', "0");

                        } else {
                            console.log("you did it!!");
                            connection.broadcast.emit('connectionupdate',"1"); 
                             callback("perfecto@!@@@");
                            //connection.emit('connectionstatus', "1");
                        }
                    });
                } catch (error) {
                    console.log(error);
                }


        });



        connection.on("disconnect", function() {
               

            console.log("disconnecting:- " + sid);
            var queryval =  connectiontodb.query("UPDATE service SET status='" + "inactive" + "' WHERE socketid='" + sid + "'", function(err, result) {

                    if (!!err) {
                        console.log(err+"///"+ queryval.sql);

                    } else {
                            connection.broadcast.emit('connectionupdate',"22"); 
                            

                    }
                });

        });

        connection.on("msg", function(msg,tousername,fromusername){

            console.log("i got it:- "+ msg+ tousername + fromusername);
               var filestatus = "0";
                var query  = connectiontodb.query("select socketid from service where username='"+tousername+"'", function(err,result){

                        if(err){
                            console.log(err+"//"+ query.sql);
                        }else if(result.length == 0){

                                var querytoinsert = connectiontodb.query("INSERT into chat (`fromusername`,`tousername`,`message`,`isfile`,`datetime`) VALUES (" + mysql.escape(fromusername) + "," + mysql.escape(tousername) + "," + mysql.escape(msg) + "," + "'" + filestatus + "'" +","+"'" + Date.now()+"'"+")", function(err, result1) {

                                        if (!!err) {
                                           // fn("0");
                                            console.log("insert query:-" + querytoinsert.sql);
                                            console.log("error 1:-" + err);
                                        } else {
                                           // fn("1");
                                            console.log("insertted successfullt inyo 1st block");

                                            //			socket.broadcast.to(result[0].socketid).emit('message', msg);
                                        }



                                    });


                        }
                        
                        else{

                                    var querytoinsert = connectiontodb.query("INSERT into chat (`fromusername`,`tousername`,`message`,`isfile`,`datetime`) VALUES (" + mysql.escape(fromusername) + "," + mysql.escape(tousername) + "," + mysql.escape(msg) + "," + "'" + filestatus + "'" +","+"'" + Date.now()+"'"+")", function(err, result1) {

                                                if (!!err) {
                                                    //fn("0");
                                                    console.log("insert query:-" + querytoinsert.sql);
                                                    console.log("error 1:-" + err);
                                                } else {
                                                    //fn("1");
                                                    console.log("insertted successfullt inyo 1st block");
                                                    console.log("perfecto!!"+ query.sql+"///"+result+"///"+ result[0].socketid);       
                                                    connection.broadcast.to(result[0].socketid).emit('chatUpdate', msg,tousername,fromusername);    
                      

                                                    //			socket.broadcast.to(result[0].socketid).emit('message', msg);
                                                }



                                            });
                                         //  connection.emit('chatUpdate',data);
				              //connection.broadcast.emit('chatUpdate',msg);   
                        }

                });

                            //  connection.emit('chatUpdate',msg,username);
				            //  connection.broadcast.emit('chatUpdate',msg,username); 


        });

    });


    server.listen(3100);
    console.log("server started....");