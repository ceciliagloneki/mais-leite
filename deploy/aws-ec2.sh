#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_REGION:-us-east-2}"
NAME="mais-leite"
SEED_DEMO="${SEED_DEMO:-}"
TYPE="${INSTANCE_TYPE:-t3.small}"
REPO="https://github.com/ceciliagloneki/mais-leite.git"

AMI=$(aws ssm get-parameter --region "$REGION" \
  --name /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
  --query Parameter.Value --output text)

SG=$(aws ec2 describe-security-groups --region "$REGION" --filters Name=group-name,Values="$NAME" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
if [ -z "$SG" ] || [ "$SG" = "None" ]; then
  SG=$(aws ec2 create-security-group --region "$REGION" --group-name "$NAME" \
    --description "+Leite: painel (80) e API (8090)" --query GroupId --output text)
  for p in 80 8090; do
    aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$SG" \
      --protocol tcp --port "$p" --cidr 0.0.0.0/0 >/dev/null
  done
fi

APP_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)

# O user-data roda em todo boot (scripts-user always): na primeira vez instala tudo;
# nas seguintes, se o IP público mudou (stop/start), atualiza o .env e refaz o build do painel.
USER_DATA=$(cat <<SCRIPT
Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0

--//
Content-Type: text/cloud-config; charset="us-ascii"

#cloud-config
cloud_final_modules:
- [scripts-user, always]

--//
Content-Type: text/x-shellscript; charset="us-ascii"

#!/bin/bash
set -e
TOKEN=\$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')
PUBLIC_HOST=\$(curl -s -H "X-aws-ec2-metadata-token: \$TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)

if [ -d /opt/mais-leite ]; then
  swapon /swapfile 2>/dev/null || true
  cd /opt/mais-leite
  if ! grep -q "^PUBLIC_HOST=\$PUBLIC_HOST\$" .env; then
    sed -i "s/^PUBLIC_HOST=.*/PUBLIC_HOST=\$PUBLIC_HOST/" .env
    docker compose up -d --build
  fi
  exit 0
fi

fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
curl -fsSL https://get.docker.com | sh
git clone $REPO /opt/mais-leite
cd /opt/mais-leite
cat > .env <<ENV
PUBLIC_HOST=\$PUBLIC_HOST
APP_SECRET=$APP_SECRET
DB_PASSWORD=$DB_PASSWORD
ENV
docker compose up -d --build
if [ -n "$SEED_DEMO" ]; then
  until curl -s -o /dev/null http://localhost:8090/; do sleep 3; done
  docker compose exec -T api php scripts/seed_demo.php $SEED_DEMO
fi
--//--
SCRIPT
)

ID=$(aws ec2 run-instances --region "$REGION" --image-id "$AMI" --instance-type "$TYPE" \
  --security-group-ids "$SG" --user-data "$USER_DATA" \
  --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=20,VolumeType=gp3}' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NAME}]" \
  --query 'Instances[0].InstanceId' --output text)

echo "Instância $ID criada, esperando subir..."
aws ec2 wait instance-running --region "$REGION" --instance-ids "$ID"
IP=$(aws ec2 describe-instances --region "$REGION" --instance-ids "$ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)

echo
echo "Pronto. Em ~5 minutos (instalação do Docker + build) o sistema estará em:"
echo "  Painel: http://$IP"
echo "  API:    http://$IP:8090"
echo "Login: admin@maisleite.local / MaisLeite@123"
echo "Para desligar: aws ec2 stop-instances --region $REGION --instance-ids $ID"
echo "Para religar:  aws ec2 start-instances --region $REGION --instance-ids $ID (o IP muda)"
echo "Para apagar tudo: aws ec2 terminate-instances --region $REGION --instance-ids $ID"
