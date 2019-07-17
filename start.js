let process = require('child_process');
// let fs = require('fs-extra');
//启动app.js
let ChildProcess  = process.fork('app.js');

ChildProcess.on('exit',function (code) {
    console.log('process exits线程退出 + '+code);
    // fs.appendFileSync('./log.txt','线程退出');
    if(code !== 0){
        process.fork('start.js');
    }
});
