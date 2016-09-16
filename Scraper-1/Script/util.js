exports.sendResponse = function(res, obj) {

    if(obj.err){
        send_failure_fn(res, obj.err);
    }else{
        var code = obj.code ? obj.code : 200;
        var contentType = obj.contentType ? obj.contentType : "application/json";
        res.header('Access-Control-Allow-Origin', "*")
        res.writeHead(code, {"Content-Type": contentType});
        var output = {};
        if(contentType == 'text/html'){
            //Need to check
            res.send(obj.data);
        }else{
            output = { error: null, data: obj.data };
            res.end(JSON.stringify(output) + "\n");
        }

    }
}


