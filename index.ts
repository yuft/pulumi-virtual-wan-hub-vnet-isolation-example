import { ResourceGroup } from "@pulumi/azure-native/resources";
import {
  DhGroup,
  HubRouteTable,
  HubVirtualNetworkConnection,
  IkeEncryption,
  P2sVpnGateway,
  VirtualHub,
  VirtualNetwork,
  VirtualWan,
  VpnAuthenticationType,
  VpnGatewayTunnelingProtocol,
  VpnServerConfiguration,
} from "@pulumi/azure-native/network";
import { Vm } from "./vm";
import { KeyVault } from "./key-vault";
import { interpolate, output } from "@pulumi/pulumi";
import { getClientConfig } from "@pulumi/azure-native/authorization";

const clientConfig = output(getClientConfig());
const tenantId = clientConfig.tenantId;
const subscriptionId = clientConfig.subscriptionId;

const rg = new ResourceGroup("conn-rg");

const wan = new VirtualWan("conn-wan", {
  resourceGroupName: rg.name,
  type: "Standard",
  virtualWANName: "conn-wan",
  allowBranchToBranchTraffic: true,
});

const hub1 = new VirtualHub("conn-hub-1", {
  resourceGroupName: rg.name,
  sku: "Basic",
  virtualHubName: "conn-hub-1",
  allowBranchToBranchTraffic: true,
  addressPrefix: "10.0.0.0/23",
  virtualWan: {
    id: wan.id,
  },
});

const blueRouteTableForHub1 = new HubRouteTable("conn-hub-1-blue-route-table", {
  resourceGroupName: rg.name,
  virtualHubName: hub1.name,
  routeTableName: "conn-hub-1-blue-route-table",
  labels: ["blue"],
});

const greenRouteTableForHub1 = new HubRouteTable(
  "conn-hub-1-green-route-table",
  {
    resourceGroupName: rg.name,
    virtualHubName: hub1.name,
    routeTableName: "conn-hub-1-green-route-table",
    labels: ["green"],
  }
);

const hub2 = new VirtualHub("conn-hub-2", {
  resourceGroupName: rg.name,
  sku: "Basic",
  virtualHubName: "conn-hub-2",
  allowBranchToBranchTraffic: true,
  addressPrefix: "10.0.2.0/23",
  virtualWan: {
    id: wan.id,
  },
});

const blueRouteTableForHub2 = new HubRouteTable("conn-hub-2-blue-route-table", {
  resourceGroupName: rg.name,
  virtualHubName: hub2.name,
  routeTableName: "conn-hub-2-blue-route-table",
  labels: ["blue"],
});

const greenRouteTableForHub2 = new HubRouteTable(
  "conn-hub-2-green-route-table",
  {
    resourceGroupName: rg.name,
    virtualHubName: hub2.name,
    routeTableName: "conn-hub-2-green-route-table",
    labels: ["green"],
  }
);

const vnetBlue1 = new VirtualNetwork("vnet-blue-1", {
  addressSpace: {
    addressPrefixes: ["10.1.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-blue-1",
  subnets: [
    {
      addressPrefix: "10.1.0.0/16",
      name: "default",
      serviceEndpoints: [
        {
          locations: ["*"],
          service: "Microsoft.KeyVault",
        },
      ],
    },
  ],
});

new KeyVault(
  "blue-vnet-1",
  rg.name,
  subscriptionId,
  tenantId,
  vnetBlue1.subnets.apply((x) => x![0].id!)
);

const vnetBlue1Vm = new Vm(
  "vnetBlue1Vm",
  rg.name,
  vnetBlue1.subnets.apply((x) => x![0].id!),
  "10.1.0.100"
);

const vnetBlue2 = new VirtualNetwork("vnet-blue-2", {
  addressSpace: {
    addressPrefixes: ["10.2.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-blue-2",
  subnets: [
    {
      addressPrefix: "10.2.0.0/16",
      name: "default",
    },
  ],
});

const vnetBlue2Vm = new Vm(
  "vnetBlue2Vm",
  rg.name,
  vnetBlue2.subnets.apply((x) => x![0].id!),
  "10.2.0.100"
);

const vnetBlue1ToHub1 = new HubVirtualNetworkConnection(
  "vnet-blue-1-to-hub-1",
  {
    connectionName: "vnet-blue-1-to-hub-1",
    name: "vnet-blue-1-to-hub-1",
    enableInternetSecurity: false,
    remoteVirtualNetwork: {
      id: vnetBlue1.id,
    },
    resourceGroupName: rg.name,
    virtualHubName: hub1.name,
    routingConfiguration: {
      associatedRouteTable: {
        id: blueRouteTableForHub1.id,
      },
      propagatedRouteTables: {
        labels: ["default", "blue"],
      },
    },
  }
);

const vnetBlue2ToHub2 = new HubVirtualNetworkConnection(
  "vnet-blue-2-to-hub-2",
  {
    connectionName: "vnet-blue-2-to-hub-2",
    name: "vnet-blue-2-to-hub-2",
    enableInternetSecurity: false,
    remoteVirtualNetwork: {
      id: vnetBlue2.id,
    },
    resourceGroupName: rg.name,
    virtualHubName: hub2.name,
    routingConfiguration: {
      associatedRouteTable: {
        id: blueRouteTableForHub2.id,
      },
      propagatedRouteTables: {
        labels: ["default", "blue"],
      },
    },
  }
);

const vnetGreen1 = new VirtualNetwork("vnet-green-1", {
  addressSpace: {
    addressPrefixes: ["10.3.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-green-1",
  subnets: [
    {
      addressPrefix: "10.3.0.0/16",
      name: "default",
    },
  ],
});

const vnetGreen1Vm = new Vm(
  "vnetGreen1Vm",
  rg.name,
  vnetGreen1.subnets.apply((x) => x![0].id!),
  "10.3.0.100"
);

const vnetGreen2 = new VirtualNetwork("vnet-green-2", {
  addressSpace: {
    addressPrefixes: ["10.4.0.0/16"],
  },
  enableDdosProtection: false,
  resourceGroupName: rg.name,
  virtualNetworkName: "vnet-green-2",
  subnets: [
    {
      addressPrefix: "10.4.0.0/16",
      name: "default",
    },
  ],
});

const vnetGreen2Vm = new Vm(
  "vnetGreen2Vm",
  rg.name,
  vnetGreen2.subnets.apply((x) => x![0].id!),
  "10.4.0.100"
);

const vnetGreen1ToHub1 = new HubVirtualNetworkConnection(
  "vnet-green-1-to-hub-1",
  {
    connectionName: "vnet-green-1-to-hub-1",
    name: "vnet-green-1-to-hub-1",
    enableInternetSecurity: false,
    remoteVirtualNetwork: {
      id: vnetGreen1.id,
    },
    resourceGroupName: rg.name,
    virtualHubName: hub1.name,
    routingConfiguration: {
      associatedRouteTable: {
        id: greenRouteTableForHub1.id,
      },
      propagatedRouteTables: {
        labels: ["default", "green"],
      },
    },
  }
);

const vnetGreen2ToHub2 = new HubVirtualNetworkConnection(
  "vnet-green-2-to-hub-2",
  {
    connectionName: "vnet-green-2-to-hub-2",
    name: "vnet-green-2-to-hub-2",
    enableInternetSecurity: false,
    remoteVirtualNetwork: {
      id: vnetGreen2.id,
    },
    resourceGroupName: rg.name,
    virtualHubName: hub2.name,
    routingConfiguration: {
      associatedRouteTable: {
        id: greenRouteTableForHub2.id,
      },
      propagatedRouteTables: {
        labels: ["default", "green"],
      },
    },
  }
);

const p2sVpnServerConfiguration = new VpnServerConfiguration("hub-vpn-config", {
  vpnServerConfigurationName: "hub-vpn-config",
  resourceGroupName: rg.name,
  vpnClientIpsecPolicies: [
    {
      dhGroup: DhGroup.DHGroup14,
      ikeEncryption: IkeEncryption.AES256,
      ikeIntegrity: "SHA384",
      ipsecEncryption: "AES256",
      ipsecIntegrity: "SHA256",
      pfsGroup: "PFS14",
      saDataSizeKilobytes: 429497,
      saLifeTimeSeconds: 86472,
    },
  ],
  vpnProtocols: [VpnGatewayTunnelingProtocol.OpenVPN],
  vpnAuthenticationTypes: [VpnAuthenticationType.AAD],
  aadAuthenticationParameters: {
    aadAudience: "41b23e61-6c1e-4545-b367-cd054e0ed4b4", // For Azure Public
    aadIssuer: interpolate`https://sts.windows.net/${tenantId}/`,
    aadTenant: interpolate`https://login.microsoftonline.com/${tenantId}/`,
  },
});

const hub1VpnGateway = new P2sVpnGateway("conn-blue-p2s-vpn-gateway", {
  gatewayName: "conn-blue-p2s-vpn-gateway",
  isRoutingPreferenceInternet: false,
  resourceGroupName: rg.name,
  virtualHub: {
    id: hub1.id,
  },
  vpnGatewayScaleUnit: 1,
  vpnServerConfiguration: {
    id: p2sVpnServerConfiguration.id,
  },
  p2SConnectionConfigurations: [
    {
      name: "config1",
      vpnClientAddressPool: {
        addressPrefixes: ["10.200.0.0/23"],
      },
      enableInternetSecurity: false,
      routingConfiguration: {
        propagatedRouteTables: {
          labels: ["blue"],
        },
      },
    },
  ],
});

const hub2VpnGateway = new P2sVpnGateway("conn-green-p2s-vpn-gateway", {
  gatewayName: "conn-green-p2s-vpn-gateway",
  isRoutingPreferenceInternet: false,
  resourceGroupName: rg.name,
  virtualHub: {
    id: hub2.id,
  },
  vpnGatewayScaleUnit: 1,
  vpnServerConfiguration: {
    id: p2sVpnServerConfiguration.id,
  },
  p2SConnectionConfigurations: [
    {
      name: "config1",
      vpnClientAddressPool: {
        addressPrefixes: ["10.201.0.0/23"],
      },
      enableInternetSecurity: false,
      routingConfiguration: {
        propagatedRouteTables: {
          labels: ["green"],
        },
      },
    },
  ],
});
