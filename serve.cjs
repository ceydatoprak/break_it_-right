const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
http.createServer((req,res)=>{
 if(req.url==='/'||req.url.startsWith('/index.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(__dirname,'index.html')));}
 else{res.writeHead(404);res.end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('BREAK & RESCUE: http://127.0.0.1:4173'));
