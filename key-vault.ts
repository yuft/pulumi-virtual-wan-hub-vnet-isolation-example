import {
  PrincipalType,
  RoleAssignment,
} from "@pulumi/azure-native/authorization";
import {
  NetworkRuleAction,
  NetworkRuleBypassOptions,
  Secret,
  SkuFamily,
  SkuName,
  Vault,
} from "@pulumi/azure-native/keyvault";
import { Input, interpolate } from "@pulumi/pulumi";
import { RandomPassword, RandomUuid } from "@pulumi/random";

export class KeyVault {
  constructor(
    name: string,
    rgName: Input<string>,
    subscriptionId: Input<string>,
    tenantId: Input<string>,
    subnetId: Input<string>
  ) {
    const keyVault = new Vault(`${name}-kv`, {
      vaultName: `${name}-kv`,
      resourceGroupName: rgName,
      properties: {
        enableRbacAuthorization: true,
        sku: {
          family: SkuFamily.A,
          name: SkuName.Standard,
        },
        tenantId: tenantId,
        networkAcls: {
          bypass: NetworkRuleBypassOptions.None,
          defaultAction: NetworkRuleAction.Deny,
          virtualNetworkRules: [
            {
              id: subnetId,
            },
          ],
        },
      },
    });

    const samplePwd = new RandomPassword(`${name}-sample-password`, {
      length: 8,
    }).result;

    new Secret("sample-secret", {
      vaultName: keyVault.name,
      secretName: "sample-secret",
      resourceGroupName: rgName,
      properties: {
        value: samplePwd,
      },
    });

    // new RoleAssignment(`${name}-kv-admin`, {
    //   roleAssignmentName: new RandomUuid(`${name}-kv-admin`).result,
    //   principalId: "xxxxx-xxxx-xxx-xxx",
    //   principalType: PrincipalType.User,
    //   roleDefinitionId: interpolate`/subscriptions/${subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483`,
    //   scope: keyVault.id,
    // });
  }
}
