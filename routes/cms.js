const express = require('express')
const  router = express.Router()
const mysql = require('./../public/db_mysql')
const date = require("silly-datetime");
//输入数字转换成大写
function intToChinese ( str ) {
  str = str+'';
  var len = str.length-1;
  var idxs = ['','十','百','千','万','十','百','千','亿','十','百','千','万','十','百','千','亿'];
  var num = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖'];
  return str.replace(/([1-9]|0+)/g,function( $, $1, idx, full) {
    var pos = 0;
    if( $1[0] != '0' ){
      pos = len-idx;
      if( idx == 0 && $1[0] == 1 && idxs[len-idx] == '十'){
        return idxs[len-idx];
      }
      return num[$1[0]] + idxs[len-idx];
    } else {
      var left = len - idx;
      var right = len - idx + $1.length;
      if( Math.floor(right/4) - Math.floor(left/4) > 0 ){
        pos = left - left%4;
      }
      if( pos ){
        return idxs[pos] + num[$1[0]];
      } else if( idx + $1.length >= len ){
        return '';
      }else {
        return num[$1[0]]
      }
    }
  });
}

//消费
router.post('/minusmoney/',(req,res)=>{
  let HandNo=req.body.HandNo
  mysql.GETDATA("select * from member where HandNo="+HandNo).then(data=>{
    if(data[0]){
      let balace=data[0].Balance
      let money=req.body.money
      money=parseInt(money)
      let newBalace=balace-money
      let mid =data[0].Id
      let today = date.format(new Date(),'YYYY-MM-DD HH:mm:ss');
      let username = req.session.username
      let note =HandNo+"于"+today+"消费了"+money+'元'
      console.log(newBalace)
      if(newBalace>=0){
        mysql.GETDATA("UPDATE member set Balance='"+newBalace+"',ResultDate='"+today+"' where HandNo='"+HandNo+"';insert into expense_logs (Member_ID,HandNo,RechargeAmount," +
          "Note,creator,changeStatus,chanType) values ('"+mid+"','"+HandNo+"','"+money+"','"+note+"','"+username+"" +
          "','"+'消费'+"','"+2+"')").then(result=>{
          res.json({
            code:200,
            message:'消费成功',
            balance:newBalace
          })
        }).catch(err=>{
          console.log(err)
        })
      }else{
          res.json({
            code:406,
            message:"消费失败，余额不足"
          })
      }
    }else{
      res.json({
        code:405,
        date:'不存在该会员'
      })
    }
  }).catch(err=>{
    console.log(err)
  })
})

//添加发票
router.post('/addinvoice/',(req,res)=>{
  console.log('hah')
  let invoiceNo = req.body.invoiceNo
  let dutyNo = req.body.dutyNo
  let name = req.body.name
  let project = req.body.project
  let balance = req.body.balance
  let balanceUpper=intToChinese(balance)
  balance=parseInt(balance)
  let admin = req.session.username
  var today = date.format(new Date(),'YYYY-MM-DD HH:mm:ss');
  console.log('zhixingle')
  mysql.GETDATA("insert into invoice (invoiceNo,dutyNo,FpName,projectName,balance,admin,balanceUpper,checkDate) values ('"+invoiceNo+"','"+dutyNo+"'" +
    ",'"+name+"','"+project+"','"+balance+"','"+admin+"','"+balanceUpper+"','"+today+"')").then(result=>{
      res.json({
        code:200,
        message:"开票成功，是否打印发票"
      })
  }).catch(err=>{
    console.log(err)
    res.json({
      code:501,
      message:"网络异常，请稍后再试"
    })
  })

})


router.get('/allinvoice/',(req,res)=>{
  mysql.GETDATA('select * from invoice').then(data=>{
    res.json({
      code:200,
      message:data
    })
  })
})

//打印发票页面
router.get('/getinvoice/',(req,res)=>{
  let invoiceNo=req.query.fid
  console.log(invoiceNo)
  mysql.GETDATA("select * from invoice where invoiceNo ="+invoiceNo).then(data=>{
    res.render('invoiceprint.html',{
      invoice:data[0]
    })
  })
})

//查找会员
router.get('/getMember/',(req,res)=>{
  let mid = req.query.mid
  mysql.GETDATA("select * from member where HandNo="+mid).then(data=>{
    if(data[0]){
      res.json({
        code:200,
        data:data[0]
      })
    }else{
      res.json({
        code:405,
        date:'不存在该会员'
      })
    }
  })
})


// 标记出售
router.post('/changeStatue/',(req,res)=>{
  let cardId = req.body.cardId
  let Salesperson=req.body.Salesperson
  mysql.GETDATA("select * from member where HandNo="+cardId).then(data=>{
    if(data[0]){
      var today = date.format(new Date(),'YYYY-MM-DD HH:mm:ss');
      if(data[0].Balance>0 && data[0].GarrdStatus===1){
        mysql.GETDATA("update member set salesTime='"+today+"',Salesperson='"+Salesperson+"',GarrdStatus=0 where HandNo='"+cardId+"'").then(data=>{
          res.json({
            code:200,
            message:'售出成功',
            data:data
          })
        }).catch(err=>{
        })
      }else{
        res.json({
          code:403,
          message:'会员卡已售出，或者余额不足'
        })
      }
    }else{
      res.json({
        code:503,
        message:'不存在该会员卡'
      })
    }
  })
})

// var today = date.format(new Date,'YYYY-MM-DD HH:mm:ss');
//注销
router.post('/delUser/',(req,res)=>{
  if (req.session.userInfo){
    req.session.destroy(function () {
      res.json({
        code:200,
        message:'注销成功'
      })
    })

  }
})

router.post('/isLogin/',(req,res)=>{
  if(req.session.userInfo){
    res.json({
      code:200,
      content:'已登录'
    })

  }else{
    res.json({
      code:310,
      content:'未登录'
    })
  }
})

// 首页数据
router.get('/index/',function (req,res) {

})


// 充值消费
router.post('/pay/',function (req, res) {
    let status = req.body.status
    let money = req.body.money
    let CardNo= req.body.cardNo   //会员卡号
    let Note = req.body.Note
    if(status==='充值'){
        mysql.GETDATA("select * from member where CardNo='"+CardNo+"'").then(function (data) {
            money = parseInt(money)
            data = data[0]
            let Balance = data.Balance
            let mid =data.Id
            const newBalance= Balance+money
            return mysql.GETDATA("insert into expense_logs (Memberid,HandNo,RechargeAmount" +
                ",Note,creator,changeStatus,chanType,GarrdStatus) values ('"+mid+"','"+data.CardNo+"','"+money+"','"+Note+"'" +
                ",'"+'刘杨'+"','"+'充值'+"',1);UPDATE member SET Balance ='"+newBalance+"' where id='"+mid+"',1;")
        }).catch(function (err) {
            return ;
        }).then(function (data) {
            res.status(200).json({
                code:200,
                message:'充值成功'
            })
        }).catch(function (err) {
            res.status(500).json({
                code:500,
                message:err
            })
        })
    }else{
        mysql.GETDATA("select * from member where CardNo='"+CardNo+"'").then(function (data) {
            money = parseInt(money)
            data = data[0]
            let Balance = data.Balance
            let mid =data.Id
            const newBalance= Balance-money
            return mysql.GETDATA("insert into expense_logs (Memberid,HandNo,RechargeAmount" +
                ",Note,creator,changeStatus,chanType) values ('"+mid+"','"+data.CardNo+"','"+money+"','"+Note+"'" +
                ",'"+'刘杨'+"','"+'消费'+"',1);UPDATE member SET Balance ='"+newBalance+"' where id='"+mid+"';")
        }).catch(function (err) {
            return ;
        }).then(function (data) {
            res.status(200).json({
                code:200,
                message:'消费成功'
            })
        }).catch(function (err) {
            res.status(500).json({
                code:500,
                message:err
            })
        })

    }
})

router.post('/getUser/',(req,res)=>{
  if(req.session.userInfo){
    let uid=req.session.userInfo
    mysql.GETDATA("SELECT * FROM USERS WHERE Id='"+uid+"'").then(data=>{
      res.json({
        code:200,
        message:data[0]
      })
    })
  }else{
    res.json({
      code:404,
      message:'请先登录'
    })
  }

})


// 新建会员
router.post('/newmember/',function (req, res) {
  let CardNo= req.body.cardNo   //会员卡号
    //cartStatus会员卡状态
    let name = req.body.cardName
    let sex =req.body.sex
  console.log(sex)
  console.log('zdsjfaj')


    let mobile = req.body.mobile
    let telephone = req.body.telephone
    let email = req.body.email
    let address = req.body.address

    const balance = req.body.balance
    const creator = req.session.username
    const Note = req.body.Note
    mysql.GETDATA('select * from member where HandNo='+CardNo).then(data=>{
      if(data[0]){
        res.json({
          code:206,
          message:'已存在该会员'
        })
      }else{
        mysql.GETDATA("insert into member (HandNo,cardname,Sex,mobile,telephone,email,address," +
          "balance,creator,Node,GarrdStatus) values ('"+CardNo+"','"+name+"','"+sex+"','"+mobile+"','"+telephone+"'" +
          ",'"+email+"','"+address+"','"+balance+"','"+creator+"','"+Note+"',1)").then(function (data) {
            return  mysql.GETDATA("select * from member where HandNo="+CardNo)
        }).then(function (data) {
            let mid = data[0].Id
            let username=req.session.username
            let today = date.format(new Date(),'YYYY-MM-DD HH:mm:ss');
            let note =CardNo+"于"+today+"充值了"+balance+'元'
            mysql.GETDATA("insert into expense_logs (Member_ID,HandNo,RechargeAmount," +
              "Note,creator,changeStatus,chanType) values ('"+mid+"','"+CardNo+"','"+balance+"','"+note+"','"+username+"" +
              "','"+'充值'+"','"+1+"')").then(function (data) {
              res.status(200).json({
                code:200,
                message:"新增会员成功",
              })
            })
        }).cache(err=>{
          console.log(err)
        })
      }
    })

})

router.get('/allMember/',(req,res)=>{
  mysql.GETDATA('select * from member').then(data=>{
    res.json({
      code:200,
      message:data
    })
  })
})

router.get('/allExponseLog/',(req,res)=>{
  mysql.GETDATA('select * from expense_logs').then(data=>{
    console.log('消费记录')
    res.json({
      code:200,
      message:data
    })
  })
})

/* cms用户登录*/
router.post('/login/',function (req,res) {
    let phone = req.body.uname
    let password = req.body.pwd
  mysql.GETDATA("SELECT * FROM USERS WHERE phone = '"+phone+"'").then(function (data) {
        if(data[0]){
            const user =data[0]
            if(password === user.password){
              req.session.userInfo=user.Id
              req.session.username=user.username
                res.json({
                    code:200,
                    message:'登录成功'
                })
            }else{
              res.json({
                code:403,
                message:'密码错误'
              })
            }
        }else {
            res.json({
              code:403,
              message:'用户名不存在'
            })
        }
    })

})


/* cms用户注册*/
router.post('/register/',function (req,res) {
    const username = req.body.username
    const password = req.body.password
    mysql.GETDATA("SELECT * FROM USERS WHERE USERNAME='"+username+"'").then(function (data) {
        if(data[0]){
            return ;
        }else{
            return mysql.GETDATA("INSERT INTO USERS (USERNAME,PASSWORD,USER_TYPE) VALUES ('"+username+"','"+password+"',1)")
        }
    }).catch(function (err) {
        res.status(500).json({
            code:412,
            message:"网络繁忙，请稍后再试"
        })
    })
        //插入数据成功后执行
        .then(function (data) {
        if(data){
            return res.status(200).json({
                code:200,
                message:'插入数据成功'
            })
        }else{
            res.status(501).json({
                code:501,
                message:"该用户已存在"
            })
        }
    }).catch(function (err){
        res.status(501).json({
            code:501,
            message:err
        })
    })
})



module.exports = router
