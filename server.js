// Eugene Fedotov
// Tennable Assessment

const http = require('http')
const fs = require('fs')
const querystring = require('querystring')
const crypto = require('crypto')
const url2 = require('url')

// Configuration fields
// Change these to what you need
const host = 'localhost'
const port = 1337

function compareHostname(a,b) {
  if (a.hostname < b.hostname)
    return -1;
  if (a.hostname > b.hostname)
    return 1;
  return 0;
}

function compareName(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

function comparePort(a,b) {
  if (a.port < b.port)
    return -1;
  if (a.port > b.port)
    return 1;
  return 0;
}

function compareUsername(a,b) {
  if (a.username < b.username)
    return -1;
  if (a.username > b.username)
    return 1;
  return 0;
}

http.createServer((req, res) => {
	const method = req.method;
	const url = req.url;
	switch(method){
		case 'POST':	
			console.log(new Date() + ' -- POST')
			if(url === '/login'){
				var auth = req.headers['authorization']
		        console.log(new Date() + ' -- ' + 'Authorization Header is: ', auth)
		        if(!auth) {
		                res.statusCode = 401
		                res.setHeader('WWW-Authenticate', 'Basic realm="User Visible Realm"')
		                res.end();
		        }
		        else if(auth){
		        	const string64 = auth.split(' ')[1];
					const plainAuth = new Buffer(string64, 'base64').toString()    
	                console.log(new Date() + ' -- ' + 'Decoded Authorization ' + plainAuth)
	                const creds = plainAuth.split(':')
	                const username = creds[0]
	                const password = creds[1]
	                if((username == 'gates') && (password == 'hunter2')) {
	                        res.statusCode = 200
	                        res.setHeader('Token', 'theCakeIsALie')
	                        res.end('<html><body>Bill Gate\'s super secret secrets<img src="data:image/jpeg;base64,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"></body></html>')
	                }
	                else {
	                        res.statusCode = 401;
	                        res.setHeader('WWW-Authenticate', 'Basic realm="User Visible Realm"')
	                        res.end('<html><body>Retry credentials</body></html>')
	                }
		        }	                
			}
			else if(url === '/logout'){
	        	if(req.headers['token'] == 'theCakeIsALie'){
	        		res.statusCode = 200
	        		res.setHeader('Token', null)
	        		res.end('<html><body>Logged out</body></html>')
	        	}
	        }
			break
		case 'GET':
			console.log(new Date() + ' -- GET')
			if(req.url === '/v1/server'){
				if(req.headers['token'] == 'theCakeIsALie'){
					fs.readFile('./data.json', 'utf8', (err, data) => {
					  	if (err) throw err
					  	console.log(new Date())
					  	console.log(data)
					 	res.setHeader('Content-Type', 'application/json')
						res.write(data)
						res.end()
					})
				}
				else{
					res.statusCode = 401
					console.log(new Date() + ' -- not logged in.')
					res.end()	
				}		
			}
			else{
				const query = url2.parse(req.url,true).query
				if(req.headers['token'] == 'theCakeIsALie'){
					fs.readFile('./data.json', 'utf8', (err, data) => {
					  	if (err) throw err
					  	const obj = JSON.parse(data)
					  	const numItems = 5 // # items per page is 5
					  	query.page = query.page || 1
					  	const index = (query.page - 1) * numItems 
					  	let resultArray = []
					  	for(let i = index; i < (numItems + index); i++){
					  		if(obj["configurations"][i])
					  			resultArray.push(obj["configurations"][i])
					  	}
					  	console.log(resultArray)
					  	switch(query.sort){
					  		case 'name':
					  			resultArray.sort(compareName)
					  			break
					  		case 'hostname':
					  			resultArray.sort(compareHostname)
					  			break
					  		case 'port':
					  			resultArray.sort(comparePort)
					  			break
					  		case 'username':
					  			resultArray.sort(compareUsername)
					  			break
					  		default:
					  			break
					  	}
						const resultObj = {"configurations": resultArray}
					  	console.log(new Date())
					  	console.log(resultObj)
					 	res.setHeader('Content-Type', 'application/json')
						res.end(JSON.stringify(resultObj))
					})
				}
			}
			break
		case 'PUT':
			console.log(new Date() + ' -- PUT')
			if(url === '/v1/server'){
				if(req.headers['token'] == 'theCakeIsALie'){
					fs.readFile('./data.json', 'utf8', (err, data) => {
						if (err) throw err
						const obj = JSON.parse(data)
						const name = req.headers.name
						const hostname = req.headers.hostname
						const port = req.headers.port
						const username = req.headers.username
						const configArray = obj.configurations;
						const arrayLength = configArray.length;
						for (let i = 0; i < arrayLength; i++) {
						    if(configArray[i].name === name){
						    	console.log(new Date() + ' -- configuration to EDIT found.')
						    	configArray[i].hostname = hostname || configArray[i].hostname
						    	configArray[i].port = port || configArray[i].port
						    	configArray[i].username = username || configArray[i].username
								obj.configurations = configArray
								fs.writeFile("./data.json", JSON.stringify(obj, null, 4), (err) => {
								    if(err) throw err
								    console.log(new Date() + ' -- The file was saved!')
								})
							    break
						    }
						}
						res.end()
					})
				}
				else if(url === '/v1/server'){
				if(req.headers['token'] == 'theCakeIsALie'){
					fs.readFile('./data.json', 'utf8', (err, data) => {
						if (err) throw err
						const obj = JSON.parse(data)
						const name = req.headers.name
						const hostname = req.headers.hostname
						const port = req.headers.port
						const username = req.headers.username
						const newConfig = {
						  	name,
						  	hostname,
						  	port,
							username
						}
						obj.configurations.push(newConfig)
						const jsonObj = JSON.stringify(obj, null, 4)
						fs.writeFile("./data.json", JSON.stringify(obj, null, 4), (err) => {
						    if(err) throw err
						    console.log(new Date() + ' -- new config created.')
						    console.log(new Date() + ' -- the file was saved!')
						    res.statusCode = 200
						    res.end()
						})
					})	
				}
				else {
					res.statusCode = 401
					console.log(new Date() + ' -- not logged in.')
					res.end()
				}			
			}
			else {
				console.log(new Date() + ' -- unsupported URL.')
			}		
			}
		break
		case 'DELETE':
			console.log(new date() + ' -- DELETE')
			if(url === '/v1/server'){
				if(req.headers['token'] == 'theCakeIsALie'){
					fs.readFile('./data.json', 'utf8', (err, data) => {
						if (err) throw err
						const obj = JSON.parse(data)
						const name = req.headers.name
						const configArray = obj.configurations;
						const arrayLength = configArray.length;
						for (let i = 0; i < arrayLength; i++) {
						    if(configArray[i].name === name){
						    	console.log(new Date() + ' -- configuration to DELETE found.')
						    	if (i > -1) {
								    configArray.splice(i, 1)
								    obj.configurations = configArray
									fs.writeFile("./data.json", JSON.stringify(obj, null, 4), (err) => {
									    if(err) throw err
									    console.log(new Date() + ' -- the file was saved!')
									})
								    break
								}
						    }
						}
						res.end()
					})
				}
				else{
					res.statusCode = 401
					console.log(new Date() + ' -- not logged in.')
					res.end()	
				}				
			}
		break
		default:
			console.log(new Date() + ' -- ' + method + ' not supported')
			break
	}
}).listen(1337, host, () => {
	const address = host + ':' + port
	console.log(new Date() + ' -- started listening on ' + address)
})