#!/bin/bash

# Load keys from ecom-2-web/.env
KEYS=$(grep NEXT_PUBLIC_GEMINI_API_KEY /home/akashbiswas/Desktop/ecom-2/ecom-2-web/.env | cut -d'=' -f2)

for key in $KEYS; do
  echo "Testing Key: ${key:0:8}..."
  RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}" \
    -H 'Content-Type: application/json' \
    -d '{
      "contents": [{
        "parts":[{"text": "Respond with OK"}]
      }]
    }')


  
  if echo "$RESPONSE" | grep -q "OK"; then
    echo "Result: SUCCESS"
  else
    echo "Result: FAILED"
    echo "$RESPONSE"
  fi
  echo "---"
done
