
var connection  =  require("../dbconnection.js");
var auth        =  require("../auth/auth");
var constant    =  require("../constant");

//exporting functions related to signup process
module.exports.userRegister = userRegister;
module.exports.getUserName  = getUserName;
module.exports.getChatList  = getChatList;

function userRegister(req,res){

var datatocheck       =  req.body;
console.log("///"+req.body.name+"//"+ req.body.username + "//"+ req.body.password);
var authResult =  auth.validateJson(datatocheck,function(err){
    
    if(!err){

            var name     = req.body.name;
            var username = req.body.username;
            var password = req.body.password;

            var dataJson = { "name"     : name,
                             "username" : username,  
                             "password" : password   
                            };
            
            var userExistorNot = auth.userAlreadyExistsOrNot(datatocheck, function(msg){

             console.log("value:- "+ msg);   
            if(msg == constant.querywrong.statuscode){

                        //return  res.send(JSON.stringify(constant.querywrong.msg));
                        

                         var data = 
                                    {
                                        "status" : false,
                                        "msg"    : constant.querywrong.msg

                                    };
                                 return res.json(data);
                } else if(msg == constant.userexist.statuscode){
                        //return  res.send(JSON.stringify(constant.userexist.msg));

                        var data = {
                                        "status" : false,
                                        "msg"    : constant.userexist.msg

                                    };
                        return res.json(data);
                }else{
                    //console.log("here you can add data!!")
                    // return res.send("you can add data in db!!");

                    var addData  = addUser(dataJson , function(msg){

                            if(msg == constant.querywrong.statuscode){
                               // return res.send(JSON.stringify(constant.querywrong.msg));
                                var data = 
                                    {
                                        "status" : false,
                                        "msg"    : constant.querywrong.msg

                                    };
                                 return res.json(data);
                            }else if(msg == constant.dataentered.statuscode){
                               //return res.send(constant.dataentered.msg);
                                var data = 
                                    {
                                        "status" : true,
                                        "msg"    : constant.dataentered.msg

                                    };
                                 return res.json(data);
                            }
                    }) 
                }

            })
        
    } else{
        //return  res.send(JSON.stringify("Error!!"));
        var data =  {
                                        "status" : false,
                                        "msg"    : "Error!!"

                    };
        return res.json(data);
    }

});
}


function getUserName(req,res){


            var query = connection.query("select username from signup where name ='"+req.body.name+"'", function(err,rows){

            if(err){
                console.log(query.sql);
                var data = {

                    "username": "null"
                }  
                return res.json(data);
            } else{
                var data = {

                    "username": rows[0].username
                }    
               return res.json(data);
            }
    });


}



function addUser(data, callback){


    var datasubmit = [
                    data.name,
                    data.username,
                    data.password    
                    ];
    var query = connection.query("insert into signup set ? ", [data], function(err,rows){

            if(err){
                console.log(query.sql);
                return callback(constant.querywrong.statuscode);
            } else{
                return callback (constant.dataentered.statuscode);     
            }
    });

}


function getChatList(req,res){


                    var fromusername = req.body.fromusername;
                    var tousername = req.body.tousername;
                    

                    

                        var query = connection.query("select *  from chat where fromusername IN ('" + fromusername + "','" + tousername + "')" + " AND tousername IN ( '" + tousername + "','" + fromusername + "')" + " ORDER BY datetime ASC LIMIT 100", function(err, result) {

                            if (!!err) {

                               
                                console.log(query.sql + err);
                                 var data= {

                                    "status" : "-1",
                                    "msg" : "no data found"
                                 }   
                                 return res.json(data);
                            } else {

                                console.log("successfully sent on the client side!!" + query.sql);
                                return res.json(result);
                            }

                        });



                  
}