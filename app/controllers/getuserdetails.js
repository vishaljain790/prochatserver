
var connection  =  require("../dbconnection.js");
var auth        =  require("../auth/auth");
var constant    =  require("../constant");

//exporting functions related to signup process
module.exports.userDetails = userDetails;



function userDetails(req,res){


        var query = connection.query("select * from service", function(err,rows){


                if(err){
                    return res.send("error!!");
                }
                else{

                        res.send(rows);

                }

        });



}

