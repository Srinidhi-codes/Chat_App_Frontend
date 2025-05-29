import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
  query GetMessages($input: GetMessagesInput!) {
    getMessage(input: $input) {
      id
      content
      messageType
      fileUrl
      createdAt
      updatedAt
      senderId
      edited
      recipientId
      reactions {
      type
      userId
    }
    }
  }
`;
