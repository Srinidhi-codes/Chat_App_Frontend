import { gql } from '@apollo/client';

export const CREATE_MESSAGE = gql`
mutation CreateMessage($input: CreateMessageInput!) {
  createMessage(input: $input) {
    id
    content
    fileUrl
    senderId
    recipientId
    messageType
  }
}`;

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($input: UpdateMessageInput!) {
    updateMessage(input: $input) {
      id
      content
      edited
      updatedAt
    }
  }
`;
