import { Button, Heading, SlideFade, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

function home() {
  const [shade, setShade] = useState(false);
  const router = useRouter();

  return (
    <VStack p="200px 40px" gap={4}>
      <SlideFade
        in={true}
        offsetY="20px"
        transition={{ enter: { duration: 0.5 } }}
        onAnimationComplete={() => {
          setShade(true);
        }}
      >
        <Heading textAlign="center" fontSize="42px">
          YoKHURoute
        </Heading>
      </SlideFade>
      <SlideFade
        in={shade}
        offsetY="20px"
        transition={{ enter: { duration: 0.5 } }}
      >
        <Button
          w="240px"
          h="50px"
          fontSize="24px"
          letterSpacing="2px"
          lineHeight="32px"
          display="block"
          colorScheme="purple"
          onClick={() => {
            router.push('/auth');
          }}
        >
          시작하기
        </Button>
      </SlideFade>
    </VStack>
  );
}

export default home;
