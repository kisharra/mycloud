#!/bin/bash
set -e

echo "==== 1. Установка зависимостей ===="
sudo apt update
sudo apt install -y sudo curl wget git build-essential \
    python3 python3-pip python3-venv python3-dev \
    postgresql postgresql-contrib \
    ca-certificates gnupg

echo "==== 1.1 Установка Node.js (последняя LTS) ===="
# Добавляем репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
# Проверка версий
node -v
npm -v

echo "==== 2. Настройка PostgreSQL ===="
sudo -u postgres psql <<EOF
DO
\$do\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mycloud') THEN
      CREATE USER mycloud WITH PASSWORD 'kisharra';
   END IF;
END
\$do\$;

CREATE DATABASE mycloud OWNER mycloud;
GRANT ALL PRIVILEGES ON DATABASE mycloud TO mycloud;
EOF

echo "==== 3. Python окружение и миграции ===="
PROJECT_DIR=$(pwd)
cd "$PROJECT_DIR"

# виртуальное окружение
if [ ! -d "server/venv" ]; then
    python3 -m venv server/venv
fi
source server/venv/bin/activate

pip install --upgrade pip
pip install -r server/requirements.txt

# папка для файлов
mkdir -p filestorage

cd server
python manage.py makemigrations
python manage.py migrate

# суперпользователь
DJANGO_SUPERUSER_PASSWORD='admin' python manage.py createsuperuser \
    --username admin \
    --email admin@example.com \
    --noinput
cd ..

echo "==== 4. Настройка systemd для Django ===="
sudo tee /etc/systemd/system/mycloud-backend.service > /dev/null <<EOF
[Unit]
Description=MyCloud Django backend
After=network.target

[Service]
User=$USER
WorkingDirectory=$PROJECT_DIR/server
ExecStart=$PROJECT_DIR/server/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mycloud-backend
sudo systemctl restart mycloud-backend

echo "==== 5. Сборка фронтенда (Vite) ===="
cd "$PROJECT_DIR/frontend"
npm install
npm run build

echo "==== 6. Настройка systemd для фронтенда (Vite + serve) ===="
sudo tee /etc/systemd/system/mycloud-frontend.service > /dev/null <<EOF
[Unit]
Description=MyCloud React (Vite) frontend
After=network.target

[Service]
User=$USER
WorkingDirectory=/opt/$PROJECT_DIR/frontend
ExecStart=$(which npm) run dev
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mycloud-frontend
sudo systemctl restart mycloud-frontend

echo "==== Деплой завершён! ===="
echo "Backend доступен на http://<server-ip>:8000"
echo "Frontend доступен на http://<server-ip>:3000"
