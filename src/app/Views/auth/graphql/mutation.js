import { gql } from '@apollo/client'

export const SIGN_UP = gql`
mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    id
    email
    token
    profileSetup
  }
}
`;

export const LOG_IN = gql`
mutation Login($input: LoginInput!) {
  login(input: $input) {
    id
    email
    token
    firstName
    lastName
    profileSetup
    color
    image
  }
}
`;
