# Azure Deployment & CI/CD Setup Guide

This guide will help you deploy the platform to Azure using the provided Bicep templates and GitHub Actions.

## 1. Prerequisites
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed.
- An active Azure Subscription.
- GitHub repository with your code.

## 2. Provision Infrastructure
Run the following commands to create a Resource Group and provision the resources using Bicep:

```bash
# Login to Azure
az login

# Create a Resource Group
az group create --name PeerLearn-RG --location eastus

# Deploy the Bicep template
az deployment group create \
  --resource-group PeerLearn-RG \
  --template-file azure/main.bicep \
  --parameters appName=peerlearn-platform
```

Take note of the `acrLoginServer` and `webAppUrl` outputs.

## 3. Configure GitHub Secrets
Go to your GitHub Repository **Settings > Secrets and variables > Actions** and add the following secrets:

| Secret Name | Description | How to get it |
|-------------|-------------|----------------|
| `AZURE_CREDENTIALS` | Service Principal Credentials | `az ad sp create-for-rbac --name "PeerLearn-Deploy" --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/PeerLearn-RG --sdk-auth` |
| `ACR_NAME` | Name of your Azure Container Registry | The name provided in the Bicep output (e.g., `peerlearnplatform`) |
| `AZURE_RESOURCE_GROUP` | The Resource Group Name | `PeerLearn-RG` |
| `AZURE_APP_NAME` | The App Service Name | `peerlearn-platform` |

## 4. Trigger Deployment
Push your changes to the `main` branch. This will trigger the `Azure Container Deployment` workflow:

1. **Build**: Builds the consolidated Docker image (Frontend + Backend).
2. **Push**: Pushes the image to your Azure Container Registry.
3. **Deploy**: Updates the Azure Web App to use the new image.

## 5. Post-Deployment
- Navigate to your `webAppUrl`.
- Configure application settings in the Azure Portal (Environment variables like `MONGO_URI`, `JWT_SECRET`, etc.).
