const express = require('express')
const path = require('path')
const front = require('./routes/front')    //前台数据
const common = require('./routes/common')    //公共数据
const cms = require('./routes/cms')    //cms数据
var bodyParser = require('body-parser')
const session = require('express-session')


var app = express()
app.use(session({
  secret :'123ffkl45', // 对session id 相关的cookie 进行签名
  resave : false,
  saveUninitialized: true // 是否保存未初始化的会话
}));
//设置跨域请求
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
app.options('*', function (req, res, next) {
res.end();
});


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//配置中间件



// app.use('/login',function(req,res){
//   //设置session
//   req.session.userinfo='张三';
//   res.send("登陆成功！");
// });
// app.use('/loginOut',function(req,res){
//   //注销session
//   req.session.destroy(function(err){
//     res.send("退出登录！"+err);
//   });
// });


app.use('/public/',express.static(path.join(__dirname,'./public')))
app.use(front)
app.use(common)
app.use('/cms',cms)

app.listen(3000,'0.0.0.0',function (){
    console.log('招财喵服务启动成功！')
})
