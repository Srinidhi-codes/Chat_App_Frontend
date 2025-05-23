import { gql } from '@apollo/client';

export const GET_SEARCH_TERM = gql`
query SearchUsers($searchTerm: String!) {
  searchContact(input: { searchTerm: $searchTerm }) {
    id
    firstName
    lastName
    email
    image
  }
}
`;

export const GET_CONTACTS_FOR_DM_LIST = gql`
  query {
    getContactsForDMList {
      id
      firstName
      lastName
      email
      image
      color
      lastMessageTime
    }
  }
`;

export const GET_ALL_CONTACTS = gql`
  query GetAllContacts {
    getAllContacts {
      label
      value
    }
  }
`;

export const GET_USER_CHANNELS = gql`
  query GetUserChannels {
    getUserChannels {
      channels {
        id
        name
        members {
          id
          firstName
          lastName
          image
        }
        admin {
          id
          firstName
          lastName
        }
        messages {
          id
          content
          fileUrl
          messageType
          createdAt
          sender {
            id
            firstName
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;
