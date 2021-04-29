var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var port = process.env.PORT || 3000;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = process.env.MONGODB_URI;


http.createServer(function (req, res) {
	if (req.url == "/") {
		file = 'formpage.html';
		fs.readFile(file, function(err, txt) {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(txt);
			res.end();
		});
	} else if (req.url == "/process") {
		res.writeHead(200, {'Content-Type':'text/html'});
		pdata = "";
		req.on('data',data => {
			pdata += data.toString();
		});
		req.on('end',()=> {
			pdata = qs.parse(pdata);
			MongoClient.connect(url,{useUnifiedTopology:true},function(err, db) {
				if (err) {
					console.log("Connection err: " + err);
				}
				var dbo = db.db("companydb");
				var coll = dbo.collection("companies");
				var query;
				if (pdata['radio'] == "name") {
					query = {Company:pdata['txt']}
				} else {
					query = {Ticker:pdata['txt']}
				}
				coll.find(query).toArray(function(err, companies) {
					if (err) {
						console.log("Error: " + err);
					} else if (companies.length == 0 ) {
						console.log("Invalid company name");
					} else {
						console.log("Companies: ");
						for (i=0; i<companies.length; i++) {
							console.log("Company name: " + companies[i].Company + " Ticker: " + companies[i].Ticker);
						}
					}
					db.close();
				})
				
			})
			res.end();
		});
	} else {
		res.writeHead(200, {'Content-Type':'text/html'});
		res.write("Unknown page request");
		res.end();
	}
}).listen(port);
