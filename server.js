var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

var responsePath = path.join(__dirname, 'response.json');

app.post("/response.json", function(req,res) {
    fs.readFile(responsePath, function(err,data) {
        if (!err) {
            res.writeHead(200);
            res.write(data);
            res.end();
        }
    });
});


app.use(express.static(__dirname));

app.listen(process.env.PORT || 8088);