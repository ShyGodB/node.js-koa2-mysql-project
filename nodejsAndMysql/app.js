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
	database: 'db1'
});
connection.connect();

//从数据库中拉取数据到网页
var elements = [];							
var checkSQL = 'select * from tab';
connection.query(checkSQL, function(err, results, fields) {
	if (err) {
        console.log(err);
    }
	for (var i = 0; i < results.length; i++) {          
        var result = results[i];
        var obj = new Object();
       	obj.id = result.id;
       	obj.name = result.name;
        elements.push(obj); 
    } 
    router.get("/", async(ctx) => { 
		await ctx.render('index', {
			title: 'The elements....',
			elements: elements
		});
	});
    
});

router.get("/rain", async(ctx) => {  //路由
	await ctx.render('/rain');
});

router.get("/add", async(ctx) => {  //路由
	await ctx.render('/add');
});

//获取用户在form表单中输入的数据，并将其存入数据库切传输到网页
router.post('/add', async(ctx) => {
	const body = ctx.request.body.element;
	for(var i = 0; i < elements.length; i++) {
		if(parseInt(body[0]) === parseInt(elements[i].id)) {
			console.log("你输入的内容id重复了，请重新输入！");
			ctx.redirect("/add");
			return;
		} 
	}
	var object = new Object();
	object.id = body[0];
	object.name = body[1];
	var addSql = 'insert into tab(id, name) values(?,?)';
	var param = [body[0],body[1]];
	connection.query(addSql, param, function(err, results, fields) {
	    if (err) {
	        console.log(err);
	    }else{
	        elements.push(object);       
	    }
	});
	ctx.redirect('/');
    
});

//删除数据
router.get("/delete", async(ctx) => {
	var id = parseInt(ctx.query.id);
	var deleteSql = 'delete from tab where id=?';
    if(elements.length > 1) {
        elements.splice(id-1,1);
        for(var k = 0; k < elements.length; k++) {	
        	connection.query(deleteSql, id, function(err,result){
			    if(err){
			        console.log('[UPDATE ERROR] '+ err.message)
			    } else {
			        console.log(`UPDATE SUCCESS `+ result.affectedRows);        //成功影响了x行  1
			    }
			});
        }
    } else {
        elements.splice(0,1);
        connection.query(deleteSql, id, function(err,result){
		    if(err){
		        console.log('[UPDATE ERROR] '+ err.message)
		    } else {
		        console.log(`UPDATE SUCCESS `+ result.affectedRows);        //成功影响了x行  1
		    }
		});
        console.log('无可删除的内容了');
    }
    ctx.redirect('/');
});

//监听端口
app.listen(3000, async(ctx) => {
	console.log("Server is running at http://127.0.0.1:3000")
})
