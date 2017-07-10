

/** user registeration table ...----signup table**/

CREATE TABLE signup (
    
    name varchar(255) NOT NULL,
    username varchar(255),
    password varchar(255),
    PRIMARY KEY (username)
);


/**  user socket id and status of registered users   **/

CREATE TABLE service(

    username varchar(255),
    name     varchar(255),
    socketid varchar(255),
    status   varchar(255),
    FOREIGN KEY(username) REFERENCES signup(username),
    PRIMARY KEY(username)

    
 
);

CREATE TABLE chat(

     fromusername varchar(255),
     tousername   varchar(255),
     message      varchar(255),
     isfile       varchar(255),
     datetime     varchar(255)   

)


