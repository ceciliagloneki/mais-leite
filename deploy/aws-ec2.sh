#!/usr/bin/env bash
# Cria uma EC2 na AWS com o +Leite rodando (MySQL + API + painel via Docker Compose).
# Pré-requisito: AWS CLI configurada (aws configure). Uso: ./deploy/aws-ec2.sh
set -euo pipefail

REGION="${AWS_REGION:-us-east-2}"  # sua conta só libera EC2 em Ohio
NAME="mais-leite"
TYPE="${INSTANCE_TYPE:-t3.small}"   # Next.js precisa de ~2 GB de RAM para o build
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

USER_DATA=$(cat <<SCRIPT
#!/bin/bash
set -e
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
curl -fsSL https://get.docker.com | sh
git clone $REPO /opt/mais-leite
cd /opt/mais-leite
PUBLIC_HOST=\$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' | xargs -I{} curl -s -H 'X-aws-ec2-metadata-token: {}' http://169.254.169.254/latest/meta-data/public-ipv4)
cat > .env <<ENV
PUBLIC_HOST=\$PUBLIC_HOST
APP_SECRET=$APP_SECRET
DB_PASSWORD=$DB_PASSWORD
ENV
docker compose up -d --build
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
echo "Para apagar tudo: aws ec2 terminate-instances --region $REGION --instance-ids $ID"
