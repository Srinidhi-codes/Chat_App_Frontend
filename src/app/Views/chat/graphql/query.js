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

export const GET_CHANNEL_MESSAGES = gql`
  query GetChannelMessages($input: GetChannelMessagesInput!) {
    getChannelMessages(input: $input) {
      id
      content
      messageType
      fileUrl
      createdAt
      updatedAt
      edited
      reactions {
      type
      userId
    }
      sender {
        id
        firstName
        lastName
        email
        image
        color
      }
    }
  }
`;
