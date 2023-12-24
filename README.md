# exploring-nodejs
Exploring Node JS

## Ubuntu Setup
```bash
#1
touch ~/bash.sh; chmod +x ~/bash.sh

#2
sudo tee ~/bash.sh<<EOF
#!/bin/bash
set -e
set -x
free -mht
df -lhT
date
which vi #check if vi is installed
EOF
~/bash.sh

#3
sudo reboot #login after reboot

#4
sudo tee ~/bash.sh<<EOF
#!/bin/bash
set -e
set -x
sudo apt update -y
sudo apt install -y dnsutils openssl curl wget tree
EOF
~/bash.sh

#5
sudo tee ~/bash.sh<<EOF
#!/bin/bash
set -e
set -x
sudo apt install -y nginx
nginx -v
cat /var/www/html/index.nginx-debian.html
cat /etc/nginx/nginx.conf
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.original.conf
sudo cp /var/www/html/index.nginx-debian.html /var/www/html/index.nginx-debian.original.html
sudo systemctl enable nginx
sudo systemctl start nginx
sleep 5s
curl -I localhost
EOF
~/bash.sh

#6
sudo tee ~/bash.sh<<EOF
#!/bin/bash
set -e
set -x
openssl req \
-newkey rsa:2048 -nodes -keyout ~/default.key \
-subj "/CN=openai.ifonepay.com/OU=Engineering/O=iFonePay Pvt. Ltd./L=Bangalore/ST=Karnataka/C=IN" \
-x509 -days 365 -out ~/default.crt
openssl x509 -subject -issuer -startdate -enddate -noout -in ~/default.crt
openssl rsa -check -noout -in ~/default.key
openssl rsa -modulus -noout -in ~/default.key | openssl md5
openssl x509 -modulus -noout -in ~/default.crt | openssl md5 # value must match with previous command
ls -l ~/
EOF
~/bash.sh

#7.1
sudo tee /var/www/html/index.nginx-debian.html<<EOF
<!DOCTYPE html>
<html>
<head>
<title>ifonepay.com</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>ifonepay.com</h1>
<p>Questions?  Send mail to <em>info@ifonepay.com</emp>.</p>
</body>
</html>
EOF

#7.2
sudo tee /etc/nginx/nginx.default.conf<<EOF
user www-data;
worker_processes 1;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
  worker_connections 512;
}
http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 30;
  types_hash_max_size 2048;
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;
  gzip on;
  root /var/www/html;
  index index.nginx-debian.html;
  server {
    listen              80 default_server;
    server_name         127.0.0.1 localhost openai.ifonepay.com;
  }
  server {
    listen              443 ssl;
    server_name         127.0.0.1 localhost openai.ifonepay.com;
    ssl_certificate     /etc/nginx/nginx.crt;
    ssl_certificate_key /etc/nginx/nginx.key;
  }
}
EOF

#7.3
sudo tee /etc/nginx/nginx.proxy.conf<<EOF
user www-data;
worker_processes 1;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;
events {
  worker_connections 512;
}
http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 30;
  types_hash_max_size 2048;
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;
  gzip on;
  server {
    listen              80 default_server;
    server_name         127.0.0.1 localhost openai.ifonepay.com;
    location / {
      # https://stackoverflow.com/questions/16157893/nginx-proxy-pass-404-error-dont-understand-why
      proxy_pass         http://127.0.0.1:8080/;
    }
  }
  server {
    listen              443 ssl;
    server_name         127.0.0.1 localhost openai.ifonepay.com;
    ssl_certificate     /etc/letsencrypt/live/openai.ifonepay.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/openai.ifonepay.com/privkey.pem;
    location / {
      # https://stackoverflow.com/questions/16157893/nginx-proxy-pass-404-error-dont-understand-why
      proxy_pass        http://127.0.0.1:8080/;
    }
  }
}
EOF

#7.4
sudo tee ~/bash.sh<<EOF
#!/bin/bash
set -e
set -x
sudo rm /etc/nginx/nginx.conf
sudo cp /home/ubuntu/default.crt /etc/nginx/nginx.crt
sudo cp /home/ubuntu/default.key /etc/nginx/nginx.key
sudo ls -l /etc/nginx
sudo nginx -t -s reload
sleep 5s
curl -I 127.0.0.1
curl -I localhost
curl -I openai.ifonepay.com
curl --insecure -I https://127.0.0.1
curl --insecure -I https://localhost
curl --insecure -I https://openai.ifonepay.com
EOF
~/bash.sh

#8
# https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d openai.ifonepay.com
sudo systemctl status certbot.timer # verify that auto-renewal is enabled
sudo certbot renew --dry-run # test auto-renewal 
```

## VSCode Setup
See:
1. [ESLint](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code)
2. [JSDoc](https://marketplace.visualstudio.com/items?itemName=crystal-spider.jsdoc-generator)
```
npm install eslint --save-dev
./node_modules/.bin/eslint --init
```

## Notes
```
```


