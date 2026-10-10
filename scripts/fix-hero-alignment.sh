#!/bin/bash
# Script para corrigir alinhamento do hero da Home caso volte a desalinhar
# Uso: bash scripts/fix-hero-alignment.sh

HOME_FILE="src/pages/public/Home.tsx"

if [ ! -f "$HOME_FILE" ]; then
  echo "Erro: $HOME_FILE não encontrado"
  exit 1
fi

# Substitui qualquer variação de bg-position pelo correto bg-center
sed -i 's/bg-\[center_right\]/bg-center/g' "$HOME_FILE"
sed -i 's/bg-\[center_left\]/bg-center/g' "$HOME_FILE"
sed -i 's/bg-right/bg-center/g' "$HOME_FILE"
sed -i 's/bg-left/bg-center/g' "$HOME_FILE"

# Garante que a linha do section tenha bg-cover bg-center bg-no-repeat
sed -i 's/bg-cover bg-\[.*\] bg-no-repeat/bg-cover bg-center bg-no-repeat/g' "$HOME_FILE"

echo "Hero alignment corrigido para bg-center em $HOME_FILE"
echo "Verifique em http://localhost:5174"