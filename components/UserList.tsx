import { Avatar, HStack, Text } from '@chakra-ui/react';
import React from 'react';

function UserList({
  name,
  email,
  image,
}: {
  name?: string;
  email?: string;
  image?: string;
}) {
  if (name) {
    return (
      <HStack
        p="6px 8px"
        spacing={4}
        bgColor="gray.100"
        borderRadius={7}
        boxShadow="0px 1px 2px rgba(0, 0, 0, 0.18)"
      >
        <Avatar size="sm" src={image} />
        <Text fontSize="15px">{name.length > 3 ? name.slice(0, 4) : name}</Text>
        <Text fontSize="20px">{email}</Text>
      </HStack>
    );
  } else {
    return <Text>Hello World!</Text>;
  }
}

export default UserList;
