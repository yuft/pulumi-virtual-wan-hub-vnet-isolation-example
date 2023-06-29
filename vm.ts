import {
  VirtualMachine,
  VirtualMachineSizeTypes,
} from "@pulumi/azure-native/compute";
import {
  IPAllocationMethod,
  NetworkInterface,
} from "@pulumi/azure-native/network";
import { Input } from "@pulumi/pulumi";

export class Vm {
  constructor(
    name: string,
    rgName: Input<string>,
    subnetId: Input<string>,
    ipAddress: Input<string>
  ) {
    const networkInterface = new NetworkInterface(`${name}-network-interface`, {
      ipConfigurations: [
        {
          name: `${name}-network-interface-ip-config`,
          privateIPAllocationMethod: IPAllocationMethod.Static,
          privateIPAddress: ipAddress,
          subnet: {
            id: subnetId,
          },
        },
      ],
      id: `${name}-network-interface`,
      resourceGroupName: rgName,
    });

    new VirtualMachine(name, {
      hardwareProfile: {
        vmSize: VirtualMachineSizeTypes.Standard_B1s,
      },
      networkProfile: {
        networkInterfaces: [
          {
            id: networkInterface.id,
          },
        ],
      },
      osProfile: {
        adminPassword: "P@ssword01",
        adminUsername: "daniel",
        computerName: name,
      },
      resourceGroupName: rgName,
      storageProfile: {
        imageReference: {
          offer: "UbuntuServer",
          publisher: "Canonical",
          sku: "18.04-LTS",
          version: "latest",
        },
      },
      vmName: name,
    });
  }
}
