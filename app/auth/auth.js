var connection  = require("../dbconnection");
var constant    = require("../constant");



module.exports.validateJson            = validateJson;
module.exports.userAlreadyExistsOrNot  = userAlreadyExistsOrNot;
module.exports.userLoginOrNot          = userLoginOrNot; 

//validating input json...
function validateJson(data, callback){
        
    for(val in data){
        
         if(data[val] == null || data[val] == ""){
                   callback("data missing");
            }
     }
     callback("");
}


function userAlreadyExistsOrNot(data, callback){


        var dataval = {

                    "name"     : data.name,
                    "username" : data.username,
                     
        };
       var queryres = connection.query("select * from signup where username = ?", dataval.username, function(err,rows){

               
                if(err){
                     console.log(queryres.sql);
                     callback(constant.querywrong.statuscode);
                } else if(rows[0]){
                     callback(constant.userexist.statuscode);    
                } else {
                    callback("");
                }
                    
               

       });

        
}


function userLoginOrNot(data, callback){


        var dataval = {

                    
                    "username" : data.username,
                    "password" : data.password
                     
        };
       var queryres = connection.query("select * from signup where username = ? AND password=?", [dataval.username,dataval.password], function(err,rows){

               
                if(err){
                     console.log(queryres.sql);
                     callback(constant.querywrong.statuscode);
                } else if(rows[0]){
                     callback(rows[0]);    
                } else {
                    callback("");
                }
                    
               

       });

        
}