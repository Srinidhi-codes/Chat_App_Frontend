import { gql } from '@apollo/client';

export const GET_USER_INFO = gql`
  query GetUserInfo {
    getUserInfo {
      id
      email
      firstName
      lastName
      image
      profileSetup
      color
    }
  }
`;