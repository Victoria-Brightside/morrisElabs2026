import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userPoolClientProps: {
    explicitAuthFlows: [
      'ALLOW_USER_PASSWORD_AUTH',
      'ALLOW_REFRESH_TOKEN_AUTH',
      'ALLOW_USER_SRP_AUTH',
    ],
  },
  userAttributes: {
    'custom:tipo': {
      dataType: 'String',
      mutable: true,
    },
  },
});