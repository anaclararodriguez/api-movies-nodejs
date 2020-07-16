const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
var actualUser;
var moviesList = [];

router.get('/', verifyToken, (req, res) => {

    var favourites = [];
    jwt.verify(req['token'], 'secretKey', function(err, decodedToken) {
        if(err) { 
            res.status(500).json({error: 'Error reading token.'});
        }else {
            actualUser = decodedToken.user.email;  
        }
    });
    fs.readFile("favourites.txt", function(err, buf) {
        if (err) res.status(500).json({error: 'Problem reading favourites.txt'});
        var movies = (buf.toString()).split('\n');
        chargeMovies(favourites, movies, actualUser);
        sortList(favourites);
        if(favourites.length == 0){
            res.send("The user has no favourites movies");
        }
        else{
            res.status(300).json(favourites);
        }
    });
});

router.post('/', verifyToken, (req, res) => {

    var movie = req.body;
    if( movie ){   
        movie.addedAt = new Date();    
        jwt.verify(req['token'], 'secretKey', function(err, decodedToken) {
            if(err) { 
                res.status(500).json({error: 'Error reading token.'});
            }else {
                movie.userEmail = decodedToken.user.email;  
            }
        });
        fs.readFile("favourites.txt", function(err, buf) {
            if (err) res.status(500).json({error: 'Problem reading favourites.txt'});
            else{
                var favourites = buf.toString();  
                favourites = favourites + "\n" + JSON.stringify(movie);                
                fs.writeFile('favourites.txt', favourites);      
                res.status(200).json({success: 'Movie added to favourites'}); 

            }
        });
    }else{
        res.status(400).json({error: 'There might be a missing or wrong parameter.'});
    }   
});

function chargeMovies(favourites, movies, actualUser){
    for(i = 0; i < movies.length; i++){ 
        var movie = movies[i];
        var email = movie.split(":").pop();
        email = cleanString(email);
        if(email == actualUser){
            movie = movie.slice(0, -1) ;
            movie = movie +', "suggestionForTodayScore": ' + Math.floor(Math.random() * 100) + " }";
            favourites.push(movie);
        }                  
    }
}

function sortList(list){

    list.sort(function(a, b){
        var movie1 = a.split(" ");
        var score1 = movie1[movie1.length-2];
        var movie2 = b.split(" ");
        var score2 = movie2[movie2.length-2];

        return score1 - score2;    
    });   
}

function cleanString(email){
    email = email.replace('"','');
    email = email.replace('"','');
    email = email.replace('}','');
    return email;
}

function verifyToken(req, res, next){

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.status(500).json({error: 'Action denied. Unauthorized user'});
    }
}

module.exports = router;