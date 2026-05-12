import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    'custom:tipo': {
      dataType: 'String',
      mutable: true,
    },
  },
  groups: ['admin', 'rrhh'],
});