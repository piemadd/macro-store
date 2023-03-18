//Yes I know this could have been a bash script but I already had node installed and I'm lazy

const fs = require('fs');

//reading the file
let config = fs.readFileSync('/app/nginx/nginx.conf', 'utf8');

//getting the token
const token = process.env.TOKEN ? process.env.TOKEN : 'test_token';

//replacing the token
config = config.replace('${AUTH_TOKEN_HERE}', token);

//writing the file
fs.writeFileSync('/app/nginx/nginx.conf', config);