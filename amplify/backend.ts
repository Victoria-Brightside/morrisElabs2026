import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

export const backend = defineBackend({ auth });

const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
const existingFlows = (cfnUserPoolClient.explicitAuthFlows as string[]) || [];

if (!existingFlows.includes('ALLOW_USER_PASSWORD_AUTH')) {
  cfnUserPoolClient.explicitAuthFlows = [
    ...existingFlows,
    'ALLOW_USER_PASSWORD_AUTH',
  ];
}