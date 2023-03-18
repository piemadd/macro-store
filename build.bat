del nixpacks.json
del build.json
nixpacks plan -e PORT=8080 -p "nodejs-18_x nginx" -b "cd src && npm install && mkdir -p /var/log/nginx && touch /var/log/nginx/error.log" -s "node /app/src/replaceAuthToken.js && nginx -c /app/nginx/nginx.conf && node /app/src/index.js" . > build.json
move /Y build.json nixpacks.json
REM too lazy to have it read from json, live with me here
nixpacks build -n macro-store -e PORT=8080 -p "nodejs-18_x nginx" -b "cd src && npm install && mkdir -p /var/log/nginx && touch /var/log/nginx/error.log" -s "node /app/src/replaceAuthToken.js && nginx -c /app/nginx/nginx.conf && node /app/src/index.js" -v .