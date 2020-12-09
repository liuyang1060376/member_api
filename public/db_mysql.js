//
// var sql = new promise({})
// var mysql = require('mysql');
// // 连接数据库的配置
// var connection = mysql.createConnection({
//     // 主机名称，一般是本机
//     host: 'localhost',
//     // 数据库的端口号，如果不设置，默认是3306
//     port: 3306,
//     // 创建数据库时设置用户名
//     user: 'root',
//     // 创建数据库时设置的密码
//     password: '12345678',
//     // 创建的数据库
//     database: 'ms_member'
// });
// // 与数据库建立连接
// connection.connect();
// // 查询数据库
// connection.query('SELECT * from users', function(err, rows, fields) {
//     console.log('The solution is: ', rows);
// });
// // 关闭连接
// connection.end();


'use strict';
const mysql  = require( 'mysql' );

var pool  = mysql.createPool( {
    connectionLimit : 50,
    // 主机名称，一般是本机
    host: 'localhost',
    // 数据库的端口号，如果不设置，默认是3306
    port: 3306,
    // 创建数据库时设置用户名
    user: 'root',
    // 创建数据库时设置的密码
    password: '12345678',
    // 创建的数据库
    database: 'ms_member',
    multipleStatements : true  //是否允许执行多条sql语句
} );
var getData = (sql) =>{
    return new Promise(function (resolve, reject){
        pool.getConnection(function (err, connection) {
            if(err){
                reject(err);
                return
            }
            connection.query(sql,function (err,data) {
                //断开连接
                connection.release()
                if(err){
                    reject(err)
                    return ;
                }
                resolve(data)
            })
        })
    })
}


//将结果已对象数组返回
var row=( sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    });
};
//返回一个对象
var first=( sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res[0] || null );
            });
        });
    });
};
//返回单个查询结果
var single=(sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject( error );
                    return;
                }
                for( let i in res[0] )
                {
                    resolve( res[0][i] || null );
                    return;
                }
                resolve(null);
            });
        });
    });
}
//执行代码，返回执行结果
var execute=(sql , ...params )=>{
    return new Promise(function(resolve,reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            connection.query( sql , params , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve( res );
            });
        });
    });
}

//模块导出
module.exports = {
    ROW     : row ,
    FIRST   : first ,
    SINGLE  : single ,
    EXECUTE : execute,
    GETDATA:   getData
}