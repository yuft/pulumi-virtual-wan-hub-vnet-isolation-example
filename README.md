# Azure Virtual Network Isolation in Azure Virtual WAN/Hub Environment

> This doc is generated by ChatGPT.

This documentation explains how to achieve network isolation within an Azure Virtual WAN/Hub environment using the Pulumi Azure Native SDK and the provided code.

## Prerequisites

Before you proceed, make sure you have the following:

1. An active Azure subscription.
2. Pulumi CLI installed and configured.
3. Basic knowledge of Azure networking concepts.

## Step 1: Set Up Pulumi Project

1. Create a new directory for your Pulumi project.
2. Open a terminal or command prompt and navigate to the project directory.
3. Initialize a new Pulumi project by running the following command:

```shell
pulumi new azure-native-typescript
```

4. Open the Pulumi configuration file and add the following lines:

```typescript
config:
  azure-native:tenantId: <Your Azure Tenant ID>
  azure-native:subscriptionId: <Your Azure Subscription ID>
```

5. Follow the prompts to create the project and select the appropriate options for your environment.

## Step 2: Import Required Modules

1. Open the `index.ts` file in your Pulumi project.
2. Add the necessary import statements at the top of the file:

```typescript
import { ResourceGroup } from "@pulumi/azure-native/resources";
import {
  HubRouteTable,
  HubVirtualNetworkConnection,
  VirtualHub,
  VirtualNetwork,
  VirtualWan,
} from "@pulumi/azure-native/network";
```

## Step 3: Define Resources

1. Inside the `main` function, define the resource group that will contain your Azure resources:

```typescript
const rg = new ResourceGroup("conn-rg");
```

2. Create a Virtual WAN by instantiating the `VirtualWan` class:

```typescript
const wan = new VirtualWan("conn-wan", {
  resourceGroupName: rg.name,
  type: "Standard",
  virtualWANName: "conn-wan",
  allowBranchToBranchTraffic: true,
});
```

3. Create a Virtual Hub by instantiating the `VirtualHub` class:

```typescript
const hub = new VirtualHub("conn-hub", {
  resourceGroupName: rg.name,
  sku: "Basic",
  virtualHubName: "conn-hub",
  allowBranchToBranchTraffic: true,
  addressPrefix: "10.0.0.0/23",
  virtualWan: {
    id: wan.id,
  },
});
```

4. Create separate route tables for the blue and green networks using the `HubRouteTable` class:

```typescript
const blueRouteTable = new HubRouteTable("conn-hub-blue-route-table", {
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routeTableName: "conn-hub-blue-route-table",
  labels: ["blue"],
});

const greenRouteTable = new HubRouteTable("conn-hub-green-route-table", {
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routeTableName: "conn-hub-green-route-table",
  labels: ["green"],
});
```

5. Create two Azure Virtual Networks for the blue network:

```typescript
const vnetBlue1 = new VirtualNetwork("vnet-blue-1", {
  addressSpace: {
    addressPrefixes: ["10.1.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-blue-1",
});

const vnetBlue2 = new VirtualNetwork("vnet-blue-2", {
  addressSpace: {
    addressPrefixes: ["10.2.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-blue-2",
});
```

6. Establish connections between the blue networks and the Virtual Hub using the `HubVirtualNetworkConnection` class:

```typescript
const vnetBlue1ToHub = new HubVirtualNetworkConnection("vnet-blue-1-to-hub", {
  connectionName: "vnet-blue-1-to-hub",
  name: "vnet-blue-1-to-hub",
  enableInternetSecurity: false,
  remoteVirtualNetwork: {
    id: vnetBlue1.id,
  },
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routingConfiguration: {
    associatedRouteTable: {
      id: blueRouteTable.id,
    },
    propagatedRouteTables: {
      ids: [
        {
          id: blueRouteTable.id,
        },
      ],
    },
  },
});

const vnetBlue2ToHub = new HubVirtualNetworkConnection("vnet-blue-2-to-hub", {
  connectionName: "vnet-blue-2-to-hub",
  name: "vnet-blue-2-to-hub",
  enableInternetSecurity: false,
  remoteVirtualNetwork: {
    id: vnetBlue2.id,
  },
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routingConfiguration: {
    associatedRouteTable: {
      id: blueRouteTable.id,
    },
    propagatedRouteTables: {
      ids: [
        {
          id: blueRouteTable.id,
        },
      ],
    },
  },
});
```

7. Create two Azure Virtual Networks for the green network:

```typescript
const vnetGreen3 = new VirtualNetwork("vnet-green-3", {
  addressSpace: {
    addressPrefixes: ["10.3.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-green-3",
});

const vnetGreen4 = new VirtualNetwork("vnet-green-4", {
  addressSpace: {
    addressPrefixes: ["10.4.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-green-4",
});
```

8. Establish connections between the green networks and the Virtual Hub:

```typescript
const vnetGreen3ToHub = new HubVirtualNetworkConnection("vnet-green-3-to-hub", {
  connectionName: "vnet-green-3-to-hub",
  name: "vnet-green-3-to-hub",
  enableInternetSecurity: false,
  remoteVirtualNetwork: {
    id: vnetGreen3.id,
  },
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routingConfiguration: {
    associatedRouteTable: {
      id: greenRouteTable.id,
    },
    propagatedRouteTables: {
      ids: [
        {
          id: greenRouteTable.id,
        },
      ],
    },
  },
});

const vnetGreen4ToHub = new HubVirtualNetworkConnection("vnet-green-4-to-hub", {
  connectionName: "vnet-green-4-to-hub",
  name: "vnet-green-4-to-hub",
  enableInternetSecurity: false,
  remoteVirtualNetwork: {
    id: vnetGreen4.id,
  },
  resourceGroupName: rg.name,
  virtualHubName: hub.name,
  routingConfiguration: {
    associatedRouteTable: {
      id: greenRouteTable.id,
    },
    propagatedRouteTables: {
      ids: [
        {
          id: greenRouteTable.id,
        },
      ],
    },
  },
});
```

## Step 4: Deploy the Resources

1. Save and close the `index.ts` file.
2. In the terminal or command prompt, run the following command

to preview the changes:

```shell
pulumi preview
```

3. Review the changes and ensure they align with your expectations.
4. Run the following command to deploy the Azure resources:

```shell
pulumi up
```

5. Confirm the deployment by typing `yes` when prompted.

## Conclusion

By following this documentation and using the provided code, you have successfully demonstrated how to achieve network isolation within an Azure Virtual WAN/Hub environment using Azure Virtual Networks. You can now access and manage isolated virtual networks within your Azure Virtual WAN/Hub setup.

The provided code creates four virtual networks and establishes connections to the Azure Virtual WAN/Hub. The two virtual networks in the "blue" category can access each other, and the two virtual networks in the "green" category can access each other as well. However, there is strict network isolation between the blue and green categories. The blue virtual networks cannot access the green virtual networks, and vice versa. This isolation ensures that resources within the blue virtual networks are unable to communicate with resources in the green virtual networks, providing a secure and segregated environment for different sets of resources.
