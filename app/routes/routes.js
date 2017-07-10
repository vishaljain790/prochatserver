module.exports = function(app){

        /*
        controllers details and list
        */
        var signup = require('../controllers/signupuser');
        var getuserdetails = require('../controllers/getuserdetails');
        var login     = require('../controllers/loginuser');


        /*
        *SIGN UP USER'S DETAILS AND API CALLING...   
        */
        app.post("/signup/user" , signup.userRegister);
        app.get ("/user/getuserdetails" , getuserdetails.userDetails);
        app.post("/user/username", signup.getUserName );


        //login api call
        app.post("/login/user",    login.userLogin);
        app.post("/users/getchatlist", signup.getChatList);




}