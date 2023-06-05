import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import { Button, HStack, Heading, SlideFade, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { db } from '@/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function login() {
  const { status, data } = useSession();
  const [shade, setShade] = useState(false);
  const router = useRouter();

  const setDoctoFB = async (name: string, email: string, image: string) => {
    const userDocRef = doc(db, 'Users', email);
    const userDocSnapShot = await getDoc(userDocRef);
    if (!userDocSnapShot.exists()) {
      await setDoc(doc(db, 'Users', email), {
        name: name,
        email: email,
        image: image,
      });
    }

    const friendDocRef = doc(db, 'Friends', email);
    const friendDocSnapShot = await getDoc(friendDocRef);
    if (!friendDocSnapShot.exists()) {
      await setDoc(doc(db, 'Friends', email), {
        name: [],
        email: [],
        image: [],
      });
    }

    const messageDocRef = doc(db, 'Message', email);
    const messageDocSnapShot = await getDoc(messageDocRef);
    if (!messageDocSnapShot.exists()) {
      await setDoc(doc(db, 'Message', email), {
        name: [],
        email: [],
        image: [],
      });
    }
  };

  if (status === 'loading') {
    return <HStack p="200px 40px">Loading...</HStack>;
  } else if (status === 'unauthenticated') {
    return (
      <VStack p="200px 40px" gap={4}>
        <Heading>로그인이 필요합니다!</Heading>
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
          로그인하러 가기
        </Button>
      </VStack>
    );
  } else {
    const name = data?.user?.name;
    const email = data?.user?.email;
    const image = data?.user?.image;
    if (name && email && image) {
      setDoctoFB(name, email, image);
    }
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
            환영합니다
            <br />
            {data?.user?.name}님!
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
              router.push('/userInfo');
            }}
          >
            메인페이지로 이동
          </Button>
        </SlideFade>
      </VStack>
    );
  }
}

export default login;
