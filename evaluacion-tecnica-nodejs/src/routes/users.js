const { Router, request } = require('express');
const { connected } = require('process');
const fs = require('fs');
const router = Router();

router.post('/', (req, res) => {
    
    const { email, firstName, lastName, password} = req.body;
    if(email && firstName && lastName && password){   
        const email = req.body.email;
        fs.readFile("users.txt", function(err, buf) {
            if (err) res.status(500).json({error: 'Problem reading users.txt'});
            const users = (buf.toString()).split('\n');
            if(emailAlreadyRegistrated(email, users)){
                res.status(400).json({error: 'The email is already registrated.'});  
            }
            else{
                saveUser(req,res);
            }
        }); 
    }else{
        res.status(400).json({error: 'There might be a missing or wrong parameter.'});
    }
});

function emailAlreadyRegistrated(email, users){
    var taken;
    for(i = 1; i < users.length; i++){               
        var line = (users[i]).split(',');
        var userEmail = line[0];
        if(userEmail == email){
            taken = true;
        }
    }
    return taken;
}

function saveUser(req,res){

    const newUser = {...req.body};
    fs.readFile("users.txt", function(err, buf) {
        if (err) res.status(500).json({error: 'Problem reading users.txt'});
        var aux = buf.toString();
        aux = aux + "\n" + getData(newUser);                
        fs.writeFile('users.txt', aux);
    });
    res.status(200).json({success: 'User registrated'});
}

function getData(newUser){

    var email = newUser.email;
    var firstName = newUser.firstName;
    var lastName = newUser.lastName;
    var password = newUser.password;

    return email + ',' + firstName+ ',' + lastName + ',' + password;
}

module.exports = router;