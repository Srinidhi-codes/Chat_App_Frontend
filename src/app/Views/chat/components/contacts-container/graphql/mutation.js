import { gql } from '@apollo/client';

export const LOGOUT_MUTATION = gql`
  mutation logout {
    logout {
      message
    }
  }
`;

export const CREATE_CHANNEL = gql`
  mutation CreateChannel($input: CreateChannelInput!) {
    createChannel(input: $input) {
      channel {
        id
        name
        members {
          id
          firstName
          lastName
        }
        admin {
          id
          firstName
        }
        createdAt
      }
    }
  }
`;

