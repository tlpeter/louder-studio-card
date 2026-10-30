const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const allowed={'/':'index.html','/fixture.json':'fixture.json','/louder-amplifier-card.js':'louder-amplifier-card.js'};
const port=Number(process.env.PORT||18905);
http.createServer((req,res)=>{
 const file=allowed[new URL(req.url,'http://127.0.0.1').pathname];if(!file){res.writeHead(404);return res.end('Not found');}
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
 res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store'});
 res.end(fs.readFileSync(path.join(__dirname,file)));
}).listen(port,'127.0.0.1',()=>console.log('Louder preview: http://127.0.0.1:'+port));

