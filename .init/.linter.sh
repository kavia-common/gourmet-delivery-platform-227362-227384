#!/bin/bash
cd /home/kavia/workspace/code-generation/gourmet-delivery-platform-227362-227384/food_delivery_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

