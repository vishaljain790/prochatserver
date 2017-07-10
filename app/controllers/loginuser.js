
var connection  =  require("../dbconnection.js");
var auth        =  require("../auth/auth");
var constant    =  require("../constant");

//exporting functions related to signup process
module.exports.userLogin = userLogin;



function userLogin(req,res){

var datatocheck       =  req.body;
console.log(req.body.username + "//"+ req.body.password);
// var authResult =  auth.validateJson(datatocheck,function(err){
    
//     if(!err){

            
            var username = req.body.username;
            var password = req.body.password;

            var dataJson = { 
                             "username" : username,  
                             "password" : password   
                            };
            
            var userExistorNot = auth.userLoginOrNot(datatocheck, function(msg){

             console.log("value:- "+ msg);   
            if(msg == constant.querywrong.statuscode){

                        //return  res.send(JSON.stringify(constant.querywrong.msg));
                        

                         var data = 
                                    {
                                        "status" : false,
                                        "msg"    : constant.querywrong.msg

                                    };
                                 return res.json(data);
                } else if(msg.name!=null){
                        //return  res.send(JSON.stringify(constant.userexist.msg));
                       // console.log("valid user:- "+ );    
                        var data = {
                                        "status" : true,
                                        "msg"    : msg

                                    };
                        return res.json(data);
                }else{
                     
                     var data = 
                                    {
                                        "status" : false,
                                        "msg"    : "user doesn't exist!!"

                                    };
                                 return res.json(data);
                }

            });
        
}



