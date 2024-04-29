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
-subj "/CN=chatbot.ifonepay.com/OU=Engineering/O=iFonePay Pvt. Ltd./L=Bangalore/ST=Karnataka/C=IN" \
-x509 -days 365 -out ~/default.crt
openssl x509 -subject -issuer -startdate -enddate -noout -in ~/default.crt
openssl rsa -check -noout -in ~/default.key
openssl rsa -modulus -noout -in ~/default.key | openssl md5
openssl x509 -modulus -noout -in ~/default.crt | openssl md5 # value must match with previous command
sudo cp ~/default.key /etc/nginx/nginx.key
sudo cp ~/default.crt /etc/nginx/nginx.crt
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
    listen              80;
    server_name         chatbot.ifonepay.com;
    if (\$host = chatbot.ifonepay.com) {
        return 301 https://$host$request_uri;
    }
  }
  server {
    listen              80 default_server;
    server_name         127.0.0.1 localhost;
  }  
  server {
    listen              443 ssl;
    server_name         chatbot.ifonepay.com;
    ssl_certificate     /etc/letsencrypt/live/chatbot.ifonepay.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatbot.ifonepay.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;
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
    listen              80;
    server_name         chatbot.ifonepay.com;
    if (\$host = chatbot.ifonepay.com) {
        return 301 https://$host$request_uri;
    }
  }
  server {
    listen              80 default_server;
    server_name         127.0.0.1 localhost;
    location / {
      # https://stackoverflow.com/questions/16157893/nginx-proxy-pass-404-error-dont-understand-why
      proxy_pass        http://127.0.0.1:8080/;
    }    
  }  
  server {
    listen              443 ssl;
    server_name         chatbot.ifonepay.com;
    ssl_certificate     /etc/letsencrypt/live/chatbot.ifonepay.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chatbot.ifonepay.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;
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
sudo certbot --nginx -d chatbot.ifonepay.com
sudo systemctl status certbot.timer # verify that auto-renewal is enabled
sudo certbot renew --dry-run # test auto-renewal
```

## Port Forwarding
1. On Azure portal, for network adapter, set `IP Settings`/`Enable IP Forwarding` (check box).
2. Configure `sysctl`.
```
sudo sysctl -a | grep -e net.ipv4.conf.all.route_localnet -e net.ipv4.ip_forward
sudo cat /etc/sysctl.conf
sudo sysctl -w net.ipv4.conf.all.route_localnet=1
sudo sysctl -w net.ipv4.ip_forward=1
sudo cat /etc/sysctl.conf
```
3. Configure `iptables`.
```
sudo iptables -A INPUT -i lo -j ACCEPT #allow traffic on localhost
sudo iptables -L --line-numbers
sudo iptables -t nat -A OUTPUT -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 127.0.0.1:8080
sudo iptables -t nat -L --line-numbers
sudo iptables -t nat -D PREROUTING 1 #delete rule number 1

sudo /usr/sbin/iptables-save | sudo tee /etc/iptables.conf
sudo /usr/sbin/iptables-restore < /etc/iptables.conf
```
See:
* [Iptables Tutorial](https://phoenixnap.com/kb/iptables-tutorial-linux-firewall)
* [Iptables on Ubuntu](https://orcacore.com/install-use-iptables-ubuntu-22-04/)
* [Netcat Webserver](https://www.geeksforgeeks.org/minimal-web-server-using-netcat/)

## VSCode Setup
See:
1. [ESLint](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code)
2. [JSDoc](https://marketplace.visualstudio.com/items?itemName=crystal-spider.jsdoc-generator)
```
npm install eslint --save-dev
./node_modules/.bin/eslint --init
```

## Asterisk
* [Asterisk Documentation](https://docs.asterisk.org/)
```bash
# Initial Setup
sudo apt update -y
sudo apt upgrade -y
which gcc
which g++
sudo reboot
# Download Source
cd /tmp
wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-20.5.2.tar.gz
tar -tvzf /tmp/asterisk-20.5.2.tar.gz
sudo tar -C /usr/local/src -xvzf /tmp/asterisk-20.5.2.tar.gz
# Install Pre-reqs
cd /usr/local/src/asterisk-20.5.2
cd ./contrib/scripts
sudo ./install_prereq test
sudo ./install_prereq install
sudo reboot
# Validate Pre-reqs
cd /usr/local/src/asterisk-20.5.2
sudo make distclean
sudo ./configure
# Build
sudo make menuselect
sudo make #compile asterisk
# Install
sudo make install #install asterisk
sudo make samples #/etc/asterisk/*.conf
sudo make config #/etc/init.d/asterisk
sudo make install-logrotate
sudo /etc/init.d/asterisk status # start | stop
cat /var/log/asterisk/messages.log
# Configure
sudo tee /etc/asterisk/pjsip.conf<<EOF
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[dell]
type=endpoint
context=hello-world
disallow=all
allow=ulaw
auth=dell
aors=dell

[dell]
type=auth
auth_type=userpass
password=hello
username=dell

[dell]
type=aor
max_contacts=1
EOF

sudo tee /etc/asterisk/extensions.conf<<EOF
[hello-world]
exten => 100, 1, Answer()
exten => 100, n, Wait(3)
exten => 100, n, Playback(hello-world)
exten => 100, n, Hangup()
EOF

sudo tee /etc/asterisk/rtp.conf<<EOF
[general]
rtpstart=10000
rtpend=10016
strictrtp=no
stunaddr=stun.zoiper.com:3478
EOF
# Reload Configuration
sudo asterisk -rx "core restart now"

```

## VSCode Setup
See:
1. [ESLint](https://www.digitalocean.com/community/tutorials/linting-and-formatting-with-eslint-in-vs-code)
2. [JSDoc](https://marketplace.visualstudio.com/items?itemName=crystal-spider.jsdoc-generator)
```
npm install eslint --save-dev
./node_modules/.bin/eslint --init
```

## Avoiding Callback Hell
1. Don't use anonymous callback functions.
2. Define function variables within class methods instead of using anonymous callbacks.
3. Don't have function variables calling other function variable within a single class method.  Keep it only one level deep.
4. Use the `bind()` method to bind `this` to callback functions to disambiguate, if required.

## Service Bus
1. [Sample Code: How to use queues](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-nodejs-how-to-use-queues?tabs=connection-string)
2. [Github Azure SDK Code Samples](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/servicebus/service-bus/samples/v7/javascript/sendMessages.js)

## Call Automation
1. [Overview](https://learn.microsoft.com/en-us/azure/communication-services/concepts/call-automation/call-automation)
2. [Azure Infra. Provisioning](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/create-communication-resource?tabs=windows&pivots=platform-azp)
3. [Phone Numbers](https://learn.microsoft.com/en-us/azure/communication-services/quickstarts/telephony/get-phone-number?tabs=windows&pivots=platform-azp)

## Speech-to-Text
1. [Speech <-> Text Overview](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text)
2. [Azure Speech Service SDK (Browser)](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/quickstarts/setup-platform?tabs=linux%2Cubuntu%2Cdotnetcli%2Cdotnet%2Cjre%2Cmaven%2Cbrowser%2Cmac%2Cpypi&pivots=programming-language-javascript#install-the-speech-sdk-for-javascript)
3. [Azure Speech Service SDK (Browser Script tag; line 41)](https://github.com/Azure-Samples/cognitive-services-speech-sdk/blob/master/quickstart/javascript/browser/from-microphone/index.html)
4. [Allow audio in Browser](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission)
5. [Azure Speech Sevice NPM pkg](https://www.npmjs.com/package/microsoft-cognitiveservices-speech-sdk)
6. [Sample Code](https://github.com/Azure-Samples/AzureSpeechReactSample/blob/main/src/App.js)
7. [Azure Speech Service Regions](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions)
8. [Azure Speech Recognized Languages](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt#speech-to-text)

```
STT: App.js
// Speech service regions: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions
const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
// Recognized languagues: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt#speech-to-text
speechConfig.speechRecognitionLanguage = 'en-US';

const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
recognizer.recognizeOnceAsync()


TSS: App.js
const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
const myPlayer = new speechsdk.SpeakerAudioDestination();
const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(myPlayer);

let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
synthesizer.speakTextAsync()
```

## Notes
1. See [Sinch](https://developers.sinch.com/docs/sms/getting-started)
2. See [Plivio](https://www.plivo.com/)
3. See [sipjs.com](https://sipjs.com/)
4. See [Asterisk](https://docs.asterisk.org/)
5. See [FreeSWITCH](https://signalwire.com/freeswitch)
```




```


