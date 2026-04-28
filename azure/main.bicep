param location string = resourceGroup().location
param appName string = 'peerlearn-${uniqueString(resourceGroup().id)}'
param containerImage string = 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service Module
module appService 'modules/app-service.bicep' = {
  name: 'appServiceDeploy'
  params: {
    location: location
    appName: appName
    appServicePlanId: appServicePlan.id
    containerImage: containerImage
  }
}

// Database Module (Optional - can be disabled if using external Mongo)
module database 'modules/database.bicep' = {
  name: 'databaseDeploy'
  params: {
    location: location
    accountName: '${appName}-db'
  }
}

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2022-02-01-preview' = {
  name: replace(appName, '-', '')
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

output webAppUrl string = appService.outputs.webAppUrl
output acrLoginServer string = acr.properties.loginServer
output mongoConnectionString string = database.outputs.connectionString
