const { Router, request } = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const router = Router();

router.post('/', (req, res) => {

    const { email, password} = req.body;
    const user = req.body;
    if(email && password){      
        fs.readFile("users.txt", function(err, buf) {
            if (err) res.status(500).json({error: 'Problem reading users.txt'});
            const users = (buf.toString()).split('\n');
          /*  if(correctUser(users, email, password)){
                setToken(user,res);
            }
            else{
                res.status(500).json({error: 'Invalid email or password.'});
            }*/
            if(correctEmail(users, email)){
                if(correctPassword(users,email,password,res)){
                    setToken(user,res);
                }else{
                    res.status(400).json({error: 'Wrong password'});
                }
            }else{
                res.status(400).json({error: 'The email is not registrated.'});
            }
        }); 
    }else{
        res.status(400).json({error: 'There might be a parameter missing.'});
    }
});

function correctEmail(users, email){

    for(i = 1; i < users.length; i++){               
        var line = (users[i]).split(',');
        var userEmail = line[0];
        if(userEmail== email){
            return true;
        }
    }
    return false;
}

function correctPassword(users, email, password, res){
    
    for(i = 1; i < users.length; i++){               
        var line = (users[i]).split(',');
        var userEmail = line[0];
        var userPassword = line[3];
        if(userEmail== email && userPassword == password){
            return true;
        }
    }
    return false;
}

function correctUser(users, email, password){
    
    for(i = 1; i < users.length; i++){               
        var line = (users[i]).split(',');
        var userEmail = line[0];
        var userPassword = line[3];
        if(userEmail== email && userPassword == password){
            return true;
        }
    }
    return false;
}

function setToken(user,res){

    jwt.sign({user}, 'secretKey', {expiresIn: '24h'}, (err, token) => {
        res.json({
            token
        });
    });
}

module.exports = router;