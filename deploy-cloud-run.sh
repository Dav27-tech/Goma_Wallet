#!/bin/bash

# Configuration
PROJECT_ID="extreme-battery-494312-d7"
REGION="europe-west1"
SERVICE_NAME="gomawallet"

echo "🚀 Début du déploiement de GomaWallet sur Cloud Run..."

# 1. Activation des API nécessaires
echo "📦 Activation des API Google Cloud..."
gcloud services enable run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --project=$PROJECT_ID

# 2. Construction de l'image avec Cloud Build
echo "🏗️ Construction de l'image avec Cloud Build..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME --project=$PROJECT_ID

# 3. Déploiement sur Cloud Run
echo "🚢 Déploiement sur Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --project=$PROJECT_ID

echo "✅ Déploiement terminé avec succès !"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format='value(status.url)' --project=$PROJECT_ID
