import { gql } from '@apollo/client';

export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($input: UserInput!) {
  updateUserInfo(input: $input) {
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
