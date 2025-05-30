import { gql } from '@apollo/client'

export const INIT_SIGN_UP = gql`
mutation InitSignUp($input: AuthInput!) {
  initSignUp(input: $input) {
    message
  }
}
`;


export const INIT_LOGIN = gql`
mutation InitLogin($input: AuthInput!) {
  initLogin(input: $input) {
    message
  }
}
`;
export const RESEND_OTP = gql`
mutation ResendOtp($input: ResendOtpInput!) {
  resendOtp(input: $input) {
    message
  }
}
`;

export const VERIFY_OTP = gql`
mutation VerifyOtp($email: String!, $otp: String!) {
  verifyOtp(email: $email, otp: $otp) {
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



export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

// Reset Password
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
