//https://github.com/andris9/Nodemailer

var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "graundm@gmail.com",
        pass: "qw123456!"
    }
});

// setup e-mail data with unicode symbols
/*
var mailOptions = {
    from: "Новый заказ ✔ <manager@interactivefishing.tv>", // sender address
    to: "graundm@gmail.com, juhnowski@gmail.com", // list of receivers
    subject: "Заказ ✔", // Subject line
    text: "Новый заказ ✔", // plaintext body
    html: "<b>Новый заказ ✔</b>" // html body
    
}
*/
var create_sql = 'CREATE TABLE Ordered ("Номер" REAL UNIQUE, "Время" REAL, "Сумма" REAL, "Статус" TEXT, "ФИО" TEXT, "Телефон" TEXT, "e-mail" TEXT, "INFO" TEXT);\n\
                  CREATE TABLE Orders (ID int NOT NULL AUTO_INCREMENT, "НомерЗаказа" TEXT, "КодТовара" REAL, "Количество" REAL)';

/**
 * Функция парситинформацию по заказу, передаваемую первой строкой
 * @param {type} s свойства продукта
 * @param {orderInfo} oi контейнер информации по заказу
 * @returns {undefined}
 */
parseOrderInfo = function(s,oi) {
    var sp=s.split("|");
    oi.orderId = sp[0];
    oi.orderDate=sp[1];
    oi.customerName =sp[2];
    oi.customerPhone=sp[3];
    oi.customerInfo=sp[4];
    oi.customerEmail=sp[5];
    oi.orderSum = sp[6];
};

/**
 * Функция парсит товары в заказе
 * @param {type} prod наименование продукта
 * @param {type} s свойства продукта
 * @param {type} str результат в html формате
 * @param {type} sql_txt результат в sql формате
 * @param {type} p_txt результат в plian text формате
 * @param {type} order_id номер заказа
 * @returns {undefined}
 */
parseOrdersProduct = function(prod,s,str,sql_txt, p_txt, order_id) {
    str+="<tr><td>"+prod+"</td>";
    sql_txt+='INSERT INTO Orders ("НомерЗаказа", "КодТовара", "Количество") values('+order_id;
    var sp=s.split("|");
    for(var i=0; i<sp.length; i++) {
       if (sp[i]!=="|") {
           str+="<td>"+sp[i]+"</td>";
           if (i<2) {
                sql_txt+= ','+sp[i];
           }
       }
    }
    str+="</tr>";
    p_txt+="\n";
    sql_txt+="); \n";
};

var http = require('http');
var querystring = require('querystring');

http.createServer(function (req, res) {
    console.log("[200 OK] " + req.method + " to " + req.url);
    console.log("req="+req.toString());
    
    if (req.method === 'POST') {
        var dataObj = new Object();
        var contentType = req.headers["content-type"];
        var fullBody = '';
        
        if (contentType) {
            if (contentType.indexOf("application/x-www-form-urlencoded") > -1) { 
                req.on('data', function(chunk) { 
                    fullBody += chunk.toString();
                    console.log("fullBody="+fullBody);
                });
                req.on('end', function() {            
                    var isFirst = true;
                    
                    var orderInfo={};
                    orderInfo.orderId = 0;
                    orderInfo.orderDate="";
                    orderInfo.customerName ="";
                    orderInfo.customerPhone="";
                    orderInfo.customerInfo="";
                    orderInfo.customerEmail="";
                    orderInfo.orderSum = 0.0;
                    orderInfo.orderList="";
                    
                    var plain_text ="Внимание! Включите опцию просмотр писем в формате html для форматированного бланка заказа.\n";
                    plain_text += "----------------------------------------------------------------------------------------\n";
                    var html_text="";
                    var sql_text="";
                    var plain_order_text="";
                    
                    var dBody = querystring.parse(fullBody);
                    for (var prop in dBody) {
                        if (isFirst) {
                            parseOrderInfo(dBody[prop], orderInfo);
                            isFirst = false;
                        } else {
                            parseOrdersProduct(prop,dBody[prop],orderInfo.orderList,sql_text,plain_order_text,orderInfo.orderId);
                            //res.write("<tr><td>" + prop + "</td><td>" + dBody[prop] + "</td></tr>");
                        }
                    }
                    
                    res.writeHead(200, "OK", {'Content-Type': 'text/html; charset=UTF-8'});  
                    res.write('<html>');
                    res.write('<head>');
                    res.write('<title>MasterGround-Заказ</title>');
                    res.write('<meta charset="utf-8">');
                    res.write('<link rel="stylesheet" href="http://interactivefishing.tv/css/order.css" />');
                    res.write('</head>');
                    res.write('<body>');
                    res.write('<img src="http://interactivefishing.tv/images/hex0.jpg" HEIGHT=107 WIDTH=675 BORDER=0>');
                    html_text+='<img src="http://interactivefishing.tv/images/hex0.jpg" HEIGHT=107 WIDTH=675 BORDER=0>';
                    
                    res.write('<p><b>Заказ <label id="orderId">'+orderInfo.orderId+'</label></b></p>');
                    html_text+='<p><b>Заказ <label id="orderId">'+orderInfo.orderId+'</label></b></p>';
                    plain_text+='Заказ №: '+orderInfo.orderId+'\n';
                            
                    res.write('<p class="order-text">Дата заказа: <label id="orderDate">'+orderInfo.orderDate+'</label></p>');
                    html_text+='<p class="order-text">Дата заказа: <label id="orderDate">'+orderInfo.orderDate+'</label></p>';
                    plain_text+='Дата заказа: '+orderInfo.orderDate+'\n';
                            
                    res.write('<p class="order-text">Статус заказа: <b><label id="orderState">Заказан</label></b></p>');
                    html_text+='<p class="order-text">Статус заказа: <b><label id="orderState">Заказан</label></b></p>';
                    plain_text+='Статус заказа: Заказан \n';
                            
                    res.write('<p class="order-text">Информация об оплате: <b><label id="orderPayment">-</label></b></p>');
                    html_text+='<p class="order-text">Информация об оплате: <b><label id="orderPayment">-</label></b></p>';
                    plain_text+='Информация об оплате: - \n';
                            
                    res.write('<img src="http://interactivefishing.tv/images/hex24.jpg" HEIGHT=5 WIDTH=683 BORDER=0>');
                    html_text+='<img src="http://interactivefishing.tv/images/hex24.jpg" HEIGHT=5 WIDTH=683 BORDER=0>';
                    
                    res.write('<p class="order-text"><b>ФИО:</b></p>');
                    html_text+='<p class="order-text"><b>ФИО:</b></p>';
                    plain_text+='ФИО: ';
                            
                    res.write('<p class="order-text" id="customerName">'+orderInfo.customerName+'</p>');
                    html_text+='<p class="order-text" id="customerName">'+orderInfo.customerName+'</p>';
                    plain_text+=orderInfo.customerName+'\n';
                            
                    res.write('<p class="order-text"><b>Телефон:</b></p>');
                    html_text+='<p class="order-text"><b>Телефон:</b></p>';
                    plain_text+='Телефон:';
                            
                    res.write('<p class="order-text" id="customerPhone">'+orderInfo.customerPhone+'</p>');
                    html_text+='<p class="order-text" id="customerPhone">'+orderInfo.customerPhone+'</p>';
                    plain_text+=orderInfo.customerPhone+'\n';
                    
                    res.write('<p class="order-text"><b>Информация:</b></p>');
                    html_text+='<p class="order-text"><b>Информация:</b></p>';
                    plain_text+='Информация: \n';
                            
                    res.write('<p class="order-text" id="customerInfo">'+orderInfo.customerInfo+'</p><br>');
                    html_text+='<p class="order-text" id="customerInfo">'+orderInfo.customerInfo+'</p><br>';
                    plain_text+=orderInfo.customerInfo+'\n';
                            
                    res.write('<p class="order-text"><b>Содержание заказа:</b></p>');
                    html_text+='<p class="order-text"><b>Содержание заказа:</b></p>';
                    plain_text+='Содержание заказа:\n';
                    
                    res.write('<table border="0" cellpadding="7" cellspacing="0">');
                    html_text+='<table border="0" cellpadding="7" cellspacing="0">';
                    
                    res.write('<thead><tr>');
                    html_text+='<thead><tr>';
                    
                    res.write('<td width="50px">Арт</td>');
                    html_text+='<td width="50px">Арт</td>';
                    
                    res.write('<td width="320px">Наименование</td>');
                    html_text+='<td width="320px">Наименование</td>';
                            
                    res.write('<td width="90px">Кол-во<br>(шт)</td>');
                    html_text+='<td width="90px">Кол-во<br>(шт)</td>';
                    
                    res.write('<td width="80px">Цена<br>(руб.)</td>');
                    html_text+='<td width="80px">Цена<br>(руб.)</td>';
                    
                    res.write('<td width="80px">Сумма<br>(руб.)</td>');
                    html_text+='<td width="80px">Сумма<br>(руб.)</td>';
                    
                    res.write('</tr></thead>');
                    html_text+='</tr></thead>';
                    plain_text+='Арт Наименование ; Кол-во ; Цена ; Сумма \n';
                    
                    res.write('<tbody id="orderList">'+orderInfo.orderList+'</tbody></table>');
                    html_text+='<tbody id="orderList">'+orderInfo.orderList+'</tbody></table>';
                    plain_text+=plain_order_text+'\n';
                            
                    res.write('<img src="http://interactivefishing.tv/images/hex61.jpg" height=6 width=684 border=0>');
                    html_text+='<img src="http://interactivefishing.tv/images/hex61.jpg" height=6 width=684 border=0>';
                    
                    res.write('<table class="order-text"><tr>');
                    html_text+='<table class="order-text"><tr>';
                            
                    res.write('<td width="540px">Итого сумма к оплате:</td>');
                    html_text+='<td width="540px">Итого сумма к оплате:</td>';
                    plain_text+='Итого сумма к оплате: ';
                    
                    res.write('<td id="orderSum">'+orderInfo.orderSum+'</td>');
                    html_text+='<td id="orderSum">'+orderInfo.orderSum+'</td>';
                    plain_text+=orderInfo.orderSum +'\n';
                            
                    res.write('</tr></table>');
                    html_text+='</tr></table>';
                    
                    res.write('<p>БОНУС:</p>');
                    html_text+='<p>БОНУС:</p>';
                    plain_text+='БОНУС \n';
                            
                    res.write('<p class="order-text">Для постоянных клиентов и Членов Клуба "Master Ground" начисление</p>');
                    html_text+='<p class="order-text">Для постоянных клиентов и Членов Клуба "Master Ground" начисление</p>';
                    plain_text+='Для постоянных клиентов и Членов Клуба "Master Ground" начисление \n';
                    
                    res.write('<p class="order-text">бонусов производится при подтверждении заказа</p>');
                    html_text+='<p class="order-text">бонусов производится при подтверждении заказа</p>';
                    plain_text+='бонусов производится при подтверждении заказа \n \n';
                            
                    res.write('<p class="order-text">&nbsp;</p>');
                    html_text+='<p class="order-text">&nbsp;</p>';
                    
                    res.write('<p class="order-text">Для подтверждения заказа оператор свяжется с Вами в ближайшее время!</p>');
                    html_text+='<p class="order-text">Для подтверждения заказа оператор свяжется с Вами в ближайшее время!</p>';
                    plain_text+='Для подтверждения заказа оператор свяжется с Вами в ближайшее время! \n';
                            
                    res.write('<p class="order-text">Благодарим Вас за посещение нашего сайта!</p>');
                    html_text+='<p class="order-text">Благодарим Вас за посещение нашего сайта!</p>';
                    plain_text+='Благодарим Вас за посещение нашего сайта! \n \n';
                            
                    res.write('<p class="order-text">&nbsp;</p>');
                    html_text+='<p class="order-text">&nbsp;</p>';
                    
                    res.write('<p class="order-text">С Уважением,</p>');
                    html_text+='<p class="order-text">С Уважением,</p>';
                    plain_text+='С Уважением,\n';
                    
                    res.write('<p class="order-text">Компания "Master Ground"</p>');
                    html_text+='<p class="order-text">Компания "Master Ground"</p>';
                    plain_text+='Компания "Master Ground" \n \n';
                            
                    res.write('<img src="http://interactivefishing.tv/images/hex61.jpg" height=6 width=684 border=0>');
                    html_text+='<img src="http://interactivefishing.tv/images/hex61.jpg" height=6 width=684 border=0>';
                            
                    res.write('<p class="order-comments">Доставка по Москве (и в пределах 10км от МКАД) до подъезда Вашего дома выполняется БЕСПЛАТНО!</p>');
                    html_text+='<p class="order-comments">Доставка по Москве (и в пределах 10км от МКАД) до подъезда Вашего дома выполняется БЕСПЛАТНО!</p>';
                    plain_text+='Доставка по Москве (и в пределах 10км от МКАД) до подъезда Вашего дома выполняется БЕСПЛАТНО! \n';
                            
                    res.write('<p class="order-comments">Стоимость услуг "Доставка на этаж", "Доставка по Московской области", "Доставка по РФ"</p>');
                    html_text+='<p class="order-comments">Стоимость услуг "Доставка на этаж", "Доставка по Московской области", "Доставка по РФ"</p>';
                    plain_text+='Стоимость услуг "Доставка на этаж", "Доставка по Московской области", "Доставка по РФ" \n';
                            
                    res.write('<p class="order-comments">рассчитывается оператором при подтверждении заказа.</p>');
                    html_text+='<p class="order-comments">рассчитывается оператором при подтверждении заказа.</p>';
                    
                    plain_text+='рассчитывается оператором при подтверждении заказа. \n';
                    res.write('</body></html>');
                    html_text+='</body></html>';
                            
                    res.end();                    
                    
                    var mailOptions = {
                        from: "Новый заказ ✔ <manager@interactivefishing.tv>", // sender address
                        to: orderInfo.customerEmail, // list of receivers
                        subject: "✔ Заказ N:"+orderInfo.orderId, // Subject line
                        text: plain_text, // plaintext body
                        html: html_text // html body
                    }
                    
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);
                        }else{
                            console.log("Message sent: " + response.message);
                        }
                    });
                    
                    mailOptions = {
                        from: "Новый заказ ✔ <"+orderInfo.customerEmail+">", // sender address
                        to: "graundm@gmail.com,juhnowski@gmail.com", // list of receivers
                        subject: "✔ Заказ N:"+orderInfo.orderId + " на обработку", // Subject line
                        text: plain_text, // plaintext body
                        html: html_text, // html body
                        attachments: [
                            {
                                fileName: orderInfo.orderId+".sql",
                                contents: new Buffer(sql_text,"utf-8")
                            },
                            {
                                fileName: "createTables.sql",
                                contents: new Buffer(create_sql,"utf-8")
                            }
                        ]
                    }
                    
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
}).listen(9080);
console.log("Ready on port 9080");


