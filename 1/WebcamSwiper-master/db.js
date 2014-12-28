            var phreebie={};
            phreebie.init = function() {
                /**
                 * customerDb - URL по которому запрашиваются файлы базы данных в формате json
                 */
                phreebie.customerDb = "http://interactivefishing.tv";
                /**
                 * customerHost - URL сайта
                 */
                phreebie.customerHost = "http://interactivefishing.tv";
                /**
                 * customerName - имя организации
                 */
                phreebie.customerName = "MasterGraund";
                /**
                 * customerShortDescription - аннотация к продукту
                 */
                phreebie.customerShortDescription = "Каталог товаров MasterGraund";
                /**
                 * Версия продукта, +0.1 при измеении БД и +1.0 при изменении программы
                 */
                phreebie.customerVersion = "0.1";
                /*
                 * customerDbSize - размер БД 
                 */
                phreebie.customerDbSize = 2000000;
            };

            /**
            * Алгоритм генерации номера заказа
            * @param {type} f Фамилия
            * @param {type} i Имя
            * @param {type} o Отчество
            * @param {type} email Почтовый адрес
            * @returns {undefined} номер заказ
            */
            phreebie.CreateOrderNumber = function(f,i,o,email) {
                var str = f+i+o+email;
                var hash = 0;
                
                if (str.length === 0) return hash;
                    for (i = 0; i < str.length; i++) {
                    char = str.charCodeAt(i);
                    hash = ((hash<<5)-hash)+char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                
                return hash;                
            };
            
            /**
             * Выводит сообщение в элемент класса status
             * @param {type} str_msg
             * @param {type} class_name
             * @returns {undefined}
             */
            phreebie.LOG = function(str_msg,class_name) {
                if (class_name===null) {
                    $('<a>' + str_msg + '</a>').appendTo(".status");
                } else {
                    $('<a class="'+class_name+'">' + str_msg + '</a><br>').appendTo(".status");
                };
            };

            /**
             * Выводит сообщение об успехе в элемент класса status
             * @param {type} str_msg сообщение
             * @returns {undefined}
             */
            phreebie.OK = function(str_msg) {
                phreebie.LOG(str_msg,"msg-OK");
            };

            /**
             * Выводит сообщение об ошибке в элемент класса status
             * @param {type} str_msg сообщение об ошибке
             * @returns {undefined}
             */
            phreebie.ERR = function(str_msg) {
                phreebie.LOG(str_msg,"msg-ERR");
            };
            
            /**
             * Закачиваем файл с данными по продуктам и создаем таблицу продуктов
             * @returns {undefined}
             */
            phreebie.createProductTable = function() {
                $.ajax({
                    url: "mydata.json",
                    success: function(data,status,jqxhr) {
                        phreebie.handleProductResponse(status,data,null,jqxhr);
                    },
                    error: function(jqxhr,status,errorMsg) {
                        phreebie.handleProductResponse(status,null,errorMsg,jqxhr);
                    }
                });
            };
            
            phreebie.handleProductResponse = function(status,data,errorMsg,jqxhr) {
                if(status ==="success") {
                    $.each(data,function(index,value){
                        var sql_fields="";
                        var sql_values="";
                        var v=new Array();
                        var idx=0;
                        var sf="";
                        
                        $.each(value,function(key,value1) {
                            if (value1!=="") {
                                if ($.isNumeric(value1)) {
                                    //v[idx]=Number(value1);
                                    sf=value1;
                                } else {
                                    //v[idx]=value1;
                                    sf='"'+value1+'"';
                                }
                                if(sql_fields.length===0) {
                                    sql_fields="INSERT INTO Product ("+"\""+key+"\"";
                                    sql_values="values("+sf;
                                    
                                } else {
                                    sql_fields+=","+"\""+key+"\"";
                                    sql_values += ","+sf;
                                }
                            }
                        });
                        
                        phreebie.db.transaction(function(tx) {
                            var s = sql_fields+") "+sql_values+")";
                            tx.executeSql(s,[],null, function (tx, error){phreebie.ERR(error.message+" sql:"+s);});//function (result) {phreebie.OK(result);}
                        });
                        
                    });
                    
                    phreebie.OK("Выполнено!");
                } else {
                    phreebie.ERR('[Получение JSON-данных для таблицы Продукты] Статус:'+status+" ошибка:"+errorMsg);
                }   
            };
    
            phreebie.init();
            
            $(document).ready(function(){
                phreebie.db = openDatabase("Product", phreebie.customerVersion, phreebie.customerShortDescription, phreebie.customerDbSize);
                phreebie.db.transaction(function(tx) {
                    tx.executeSql("SELECT COUNT(*) FROM Product", [], function(result){
                        tx.executeSql("SELECT COUNT(*) FROM Product", [],function(res){tx.
                                    executeSql('CREATE TABLE Product ("КодТовара" REAL UNIQUE, "Товар" TEXT, "Масса" REAL, "КоличествоВКоробке" INTEGER, "ОстатокНаСкладе" INTEGER, "Сортировка" INTEGER, "Переход" INTEGER, "ГруппаТовара" INTEGER, "КоличествоБонусаТоварного" INTEGER, "ПроцентБонусаТоварного" REAL, "ID_Поставщик" INTEGER, "ЦенаЗакупки" REAL, "НачальныйОстаток" REAL, "ПРОБА" TEXT, "Факт1" INTEGER, "Свободный1" INTEGER, "Инвентура" INTEGER, "Факт2" INTEGER, "Свободный2" INTEGER)', [], null, null);},null);
                    } , function (tx, error) {
                    tx.executeSql('CREATE TABLE Product ("КодТовара" REAL UNIQUE, "Товар" TEXT, "Масса" REAL, "КоличествоВКоробке" INTEGER, "ОстатокНаСкладе" INTEGER, "Сортировка" INTEGER, "Переход" INTEGER, "ГруппаТовара" INTEGER, "КоличествоБонусаТоварного" INTEGER, "ПроцентБонусаТоварного" REAL, "ID_Поставщик" INTEGER, "ЦенаЗакупки" REAL, "НачальныйОстаток" REAL, "ПРОБА" TEXT, "Факт1" INTEGER, "Свободный1" INTEGER, "Инвентура" INTEGER, "Факт2" INTEGER, "Свободный2" INTEGER)', [], null, null);
                    });});
                
                phreebie.db1 = openDatabase("Ordered", phreebie.customerVersion, phreebie.customerShortDescription, phreebie.customerDbSize);
                phreebie.db1.transaction(function(tx) {
                    tx.executeSql("SELECT COUNT(*) FROM Ordered", [], null, function (tx, error) {
                    tx.executeSql('CREATE TABLE Ordered ("Номер" REAL UNIQUE, "Время" REAL, "Сумма" REAL, "Статус" TEXT)', [], null, null);
                    });});

                phreebie.db2 = openDatabase("Order", phreebie.customerVersion, phreebie.customerShortDescription, phreebie.customerDbSize);
                phreebie.db2.transaction(function(tx) {
                    tx.executeSql("SELECT COUNT(*) FROM Order", [], null, function (tx, error) {
                    tx.executeSql('CREATE TABLE Order (id REAL UNIQUE, "НомерЗаказа" TEXT, "КодТовара" REAL, "Количество" REAL)', [], null, null);
                    });});
                
                phreebie.db3 = openDatabase("Favorites", phreebie.customerVersion, phreebie.customerShortDescription, phreebie.customerDbSize);
                phreebie.db3.transaction(function(tx) {
                    tx.executeSql("SELECT COUNT(*) FROM Favorites", [], null, function (tx, error) {
                    tx.executeSql('CREATE TABLE Favorites (id REAL UNIQUE, "КодТовара" REAL)', [], null, null);
                    });});
                
                phreebie.db4 = openDatabase("MasterGraund", phreebie.customerVersion, phreebie.customerShortDescription, phreebie.customerDbSize);
                phreebie.db4.transaction(function(tx) {
                    tx.executeSql("SELECT COUNT(*) FROM MasterGraund", [], null, function (tx, error) {
                    tx.executeSql("CREATE TABLE MasterGraund (id REAL UNIQUE, LastUpdate REAL)", [], null, null);
                    });});
                
                phreebie.createProductTable();                
            });
            
            $(".cashable").change(function(){
                $.cookie($(this),$(this).val());
            });            