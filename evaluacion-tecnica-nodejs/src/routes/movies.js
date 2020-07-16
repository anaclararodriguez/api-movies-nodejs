const { Router } = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const router = Router();

router.get('/', verifyToken, async (req, res) => {

    jwt.verify(req.token, 'secretKey', (err, authData) => {
        if(err){
          res.status(500).json({error: 'Error reading token.'});      
        }
    });
    const { keyword } = req.body;
    if( keyword ){   
        const response = await fetch('https://api.themoviedb.org/3/keyword/' + keyword + '/movies?api_key=8108ddf94b29b2a10aa109a39f02437c&language=en-US&include_adult=false');
        const movies = await response.json();
        var list = movies.results;
        if(movies.status_message) res.status(500).json({error: 'There are no movies to the keyword given.'});  
        setSuggestionScore(list);
        sortList(list);
        res.json(list);
    }
    else{
        const response = await fetch('https://api.themoviedb.org/3/discover/movie?api_key=8108ddf94b29b2a10aa109a39f02437c');
        var movies = await response.json();
        var list = movies.results;
        setSuggestionScore(list);
        sortList(list);
        res.json(list);
    }
});

function setSuggestionScore(list){

    list.forEach(element => {
        element.suggestionScore = Math.floor(Math.random() * 100);
    }); 
}

function sortList(list){
    
    list.sort(function(a, b){
        return a.suggestionScore - b.suggestionScore;
    });   
}

function verifyToken(req, res, next){

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }else{
        res.status(400).json({error: 'Action denied.'});  
    }
}

module.exports = router;