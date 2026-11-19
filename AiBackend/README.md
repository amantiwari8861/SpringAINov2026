# Spring Ai implementation

```bash
chmod 400 "SpringAI.pem"
ssh -i "SpringAI.pem" ubuntu@ec2-13-201-131-217.ap-south-1.compute.amazonaws.com
sudo apt update && sudo apt upgrade -y
sudo apt install openjdk-25-jdk-headless -y
sudo apt install maven -y
mvn -v && javac --version && java -version
export OPENAI_API_KEY="your_api_key_here"
source ~/.bashrc
sudo apt install postgresql postgresql-contrib -y
psql --version
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
sudo -u postgres psql
create database ecommerce;
ALTER USER postgres WITH PASSWORD '1234';
\q
mvn clean install -Popenai -Dspring.profiles.active=openai
mvn spring-boot:run -Popenai -Dspring-boot.run.profiles=openai
http://13.201.131.217:8080/api/v1/openai/chat?prompt=hii
http://api.iamandroid.in:8080/api/v1/openai/chat?prompt=hii
sudo apt install nginx -y
sudo systemctl enable --now nginx
sudo nano /etc/nginx/sites-available/ecommerce

server {
    listen 80;
    server_name api.iamandroid.in;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/ecommerce
sudo nginx -t
sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.iamandroid.in

https://api.iamandroid.in/api/v1/openai/chat?prompt=from now your name is siri

 AiBackend-0.0.1-SNAPSHOT.jar
 sudo nano /etc/systemd/system/aibackend.service

[Unit]
Description=Spring Boot AI Backend
After=network.target postgresql.service

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/SpringAINov2026/AiBackend

ExecStart=/usr/bin/java -jar /home/ubuntu/SpringAINov2026/AiBackend/target/AiBackend-0.0.1-SNAPSHOT.jar --spring.profiles.active=openai

SuccessExitStatus=143
Restart=always
RestartSec=10

EnvironmentFile=/etc/aibackend.env

[Install]
WantedBy=multi-user.target
 
 
 
 
sudo nano /etc/aibackend.env
OPENAI_API_KEY=sk-your_api_key_here

DB_PASSWORD=1234

sudo chmod 600 /etc/aibackend.env
sudo chown root:root /etc/aibackend.env
```