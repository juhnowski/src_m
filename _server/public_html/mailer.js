var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "qqq@gmail.com",
        pass: "qqq"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "Новый заказ ✔ <manager@interactivefishing.tv>", // sender address
    to: "graundm@gmail.com, juhnowski@gmail.com", // list of receivers
    subject: "Заказ ✔", // Subject line
    text: "Новый заказ ✔", // plaintext body
    html: "<b>Новый заказ ✔</b>" // html body
    
}

var http = require('http');
var querystring = require('querystring');

http.createServer(function (req, res) {
    console.log("[200 OK] " + req.method + " to " + req.url);

    if (req.method === 'POST') {
        var dataObj = new Object();
        var contentType = req.headers["content-type"];
        var fullBody = '';
        
        if (contentType) {
            if (true) { //contentType.indexOf("application/x-www-form-urlencoded") > -1
                req.on('data', function(chunk) { fullBody += chunk.toString();});
                req.on('end', function() {            
                    res.writeHead(200, "OK", {'Content-Type': 'text/html'});  
                    res.write('<html><head><title>>Order accepted</title></head><body>');
                    res.write('<style>th, td {text-align:left; padding:5px; color:black}\n');
                    res.write('th {background-color:grey; color:white; min-width:10em}\n');
                    res.write('td {background-color:lightgrey}\n');
                    res.write('caption {font-weight:bold}</style>');
                    
                    res.write('<table border="1"><caption>Order accepted</caption>');
                    res.write('<tr><th>Details:</th><th>Value</th>');
/*                    var dBody = querystring.parse(fullBody);
                    for (var prop in dBody) {
                    res.write("<tr><td>" + prop + "</td><td>" + dBody[prop] + "</td></tr>");
                    }
                    res.write('</table></body></html>');
*/
                    res.write('</body></html>');
                    res.end();                    
                    
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                        }else{
                            console.log("Message sent: " + response.message);
                        }
                    });

                });
            } 
        }
    }
}).listen(80);
console.log("Ready on port 80");


