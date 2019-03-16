const Koa = require('koa');
const json = require('koa-json');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new KoaRouter();
const mysql = require('mysql');

app.use(json());  
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());  //// 配置路由模块

//配置模版引擎
render(app, {
	root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'html',
    cache: false,
    debug: false
});

//配置数据库并且连接
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234qwer',
	database: 'BBS'
});
connection.connect();

//获取用户在form表单中输入的数据，判断是否合乎规则，如果正确则将数据存入数据库
router.post('/signUp', async(ctx) => {
	const name = ctx.request.body.usrname; //获取用户输入的名字
	const ema = ctx.request.body.element;  //获取用户输入的邮箱地址
	const passwod = ctx.request.body.data;  //获取用户输入的密码
	const findName = 'select * from user where username=?';
	connection.query(findName, name, function(err, results) { //验证用户输入的名字是否被占用
		if(err) {
			console.log(err)
		} else {
			if(results.length !== 0 ) {
				console.log('你输入的用户名已被注册，请重新输入!');
			} else {
				console.log('继续');
				const findEma = 'select * from user where email=?';
				connection.query(findEma, ema, function(err, results) { ////验证用户输入的名邮箱是否被占用
					if(err) {
						console.log(err)
					} else {
						if(results.length !== 0 ) {
							console.log('你输入的邮箱已被注册，请重新输入!');
						} else {
							console.log('继续');
							var addSql = 'insert into user(username, email, password) values(?, ?, ?)';
							var params = [name, ema, passwod];
							connection.query(addSql, params, function(err, results) { //数据写入数据库
							    if (err) {
							        console.log(err);
							    } else {
							    	console.log('注册成功');
							    	console.log('数据存入数据库成功');
							    }
							});
						}
					}
				});
			}
		}
	});
	
	//ctx.redirect('/');
});

//获取用户在form表单中输入的数据，并将其与数据库中储存的信息进行对比以判断是否允许该用户登录
router.post('/loginIn', async(ctx) => {
	const eMail = ctx.request.body.eMail;  //获取用户输入的邮箱地址
	const passWd = ctx.request.body.passWd;  //获取用户输入的密码
	const checkSql = 'select * from user where email=? and password=?';
	const param = [eMail, passWd];  //定义参数
	connection.query(checkSql, param, function(err, results) {  //返回的results是一个array
	    if (err) {
	        console.log(err);
	    } else { 
	    	if(results.length !== 0 && (results[0].email === eMail && results[0].password === passWd)) {
	    		console.log('登录成功');	
	    	} else {
    			console.log('登录失败');
    		}
	    }
	});
	//ctx.redirect('/');
});

router.get("/", async(ctx) => { //路由
	await ctx.render('index');
});
router.get("/signUp", async(ctx) => {  //路由
	await ctx.render('/signUp');
});
router.get("/loginIn", async(ctx) => {  //路由
	await ctx.render('/loginIn');
});                    

//监听端口
app.listen(3000, async(ctx) => {
	console.log("Server is running at http://127.0.0.1:3000")
})
