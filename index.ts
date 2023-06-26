import { ResourceGroup } from "@pulumi/azure-native/resources";
import { HubRouteTable, HubVirtualNetworkConnection, VirtualHub, VirtualNetwork, VirtualWan } from "@pulumi/azure-native/network";

const rg = new ResourceGroup("conn-rg");

const wan = new VirtualWan('conn-wan', {
    resourceGroupName: rg.name,
    type: 'Standard',
    virtualWANName: 'conn-wan',
    allowBranchToBranchTraffic: true,
  });

const hub = new VirtualHub('conn-hub', {
    resourceGroupName: rg.name,
    sku: 'Basic',
    virtualHubName: 'conn-hub',
    allowBranchToBranchTraffic: true,
    addressPrefix: '10.0.0.0/23',
    virtualWan: {
        id: wan.id
    }
  });

const blueRouteTable = new HubRouteTable('conn-hub-blue-route-table', {
    resourceGroupName: rg.name,
    virtualHubName: hub.name,
    routeTableName: 'conn-hub-blue-route-table',
    labels: ['blue'],
  });

const greenRouteTable = new HubRouteTable('conn-hub-green-route-table', {
    resourceGroupName: rg.name,
    virtualHubName: hub.name,
    routeTableName: 'conn-hub-green-route-table',
    labels: ['green']
  });


  const vnetBlue1 = new VirtualNetwork('vnet-blue-1', {
    addressSpace: {
      addressPrefixes: ['10.1.0.0/16'],
    },
    enableDdosProtection: false,
    resourceGroupName: rg.name,
    virtualNetworkName: 'vnet-blue-1',
  });

  const vnetBlue2 = new VirtualNetwork('vnet-blue-2', {
    addressSpace: {
      addressPrefixes: ['10.2.0.0/16'],
    },
    enableDdosProtection: false,
    resourceGroupName: rg.name,
    virtualNetworkName: 'vnet-blue-2',
  });


  const vnetBlue1ToHub = new HubVirtualNetworkConnection(
    'vnet-blue-1-to-hub',
    {
      connectionName:  'vnet-blue-1-to-hub',
      name:  'vnet-blue-1-to-hub',
      enableInternetSecurity: false,
      remoteVirtualNetwork: {
        id: vnetBlue1.id,
      },
      resourceGroupName: rg.name,
      virtualHubName: hub.name,
      routingConfiguration: {
        associatedRouteTable: {
            id: blueRouteTable.id
        },
        propagatedRouteTables: {
            ids: [
                {
                    id: blueRouteTable.id
                }
            ]
        }
      }
    }
  );

  const vnetBlue2ToHub = new HubVirtualNetworkConnection(
    'vnet-blue-2-to-hub',
    {
      connectionName:  'vnet-blue-2-to-hub',
      name:  'vnet-blue-2-to-hub',
      enableInternetSecurity: false,
      remoteVirtualNetwork: {
        id: vnetBlue2.id,
      },
      resourceGroupName: rg.name,
      virtualHubName: hub.name,
      routingConfiguration: {
        associatedRouteTable: {
            id: blueRouteTable.id
        },
        propagatedRouteTables: {
            ids: [
                {
                    id: blueRouteTable.id
                }
            ]
        }
      }
    }
  );


  const vnetGreen3 = new VirtualNetwork('vnet-green-3', {
    addressSpace: {
      addressPrefixes: ['10.3.0.0/16'],
    },
    enableDdosProtection: false,
    resourceGroupName: rg.name,
    virtualNetworkName: 'vnet-green-3',
  });

  const vnetGreen4 = new VirtualNetwork('vnet-green-4', {
    addressSpace: {
      addressPrefixes: ['10.4.0.0/16'],
    },
    enableDdosProtection: false,
    resourceGroupName: rg.name,
    virtualNetworkName: 'vnet-green-4',
  });


  const vnetGreen3ToHub = new HubVirtualNetworkConnection(
    'vnet-green-3-to-hub',
    {
      connectionName:  'vnet-green-3-to-hub',
      name:  'vnet-green-3-to-hub',
      enableInternetSecurity: false,
      remoteVirtualNetwork: {
        id: vnetGreen3.id,
      },
      resourceGroupName: rg.name,
      virtualHubName: hub.name,
      routingConfiguration: {
        associatedRouteTable: {
            id: greenRouteTable.id
        },
        propagatedRouteTables: {
            ids: [
                {
                    id: greenRouteTable.id
                }
            ]
        }
      }
    }
  );

  const vnetGreen4ToHub = new HubVirtualNetworkConnection(
    'vnet-green-4-to-hub',
    {
      connectionName:  'vnet-green-4-to-hub',
      name:  'vnet-green-4-to-hub',
      enableInternetSecurity: false,
      remoteVirtualNetwork: {
        id: vnetGreen4.id,
      },
      resourceGroupName: rg.name,
      virtualHubName: hub.name,
      routingConfiguration: {
        associatedRouteTable: {
            id: greenRouteTable.id
        },
        propagatedRouteTables: {
            ids: [
                {
                    id: greenRouteTable.id
                }
            ]
        },
      }
    }
  );
