Disclaimer: hardcoded values are on purpose for now.

data-backup.json is the saved data, just in case you want to restore data.json.

Query parameters you can use, examples:

sort=hostname,
page=2

localhost:1337/v1/server?sort=username&page=3

Other endpoints:

/login - POST
/logout - POST
/server - GET - gets list of configs from JSON
/server - POST - submit username and password, and get a token in return.
/server - PUT - create or modify a config from the JSON
/server - DELETE - delete a config from the JSON

For checking Login, use the username "gates" and password "hunter2". (hopefully you can see instead of asterisks)
When submitting any modifications, make sure to use the header "Token" : "theCakeIsALie". No need for username and password.
