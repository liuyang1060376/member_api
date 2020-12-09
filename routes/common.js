const express = require('express')
const mysql = require('./../public/db_mysql')

var router = express.Router()



/* cms用户注册*/
router.post('/register',function (req,res) {
    const username = req.body.username
    const password = req.body.password

    return res.status(500).send('Server Eroor')
    return res.status(500).json({
        code:200,
        message:'登录成功'
    })

})

module.exports=router
