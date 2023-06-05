import {
  CircleIcon,
  EmailIcon,
  EyeCloseIcon,
  EyeIcon,
  KeyIcon,
} from '@/Icons/icons';
import CommonInput from '@/components/CommonInput';
import UserList from '@/components/UserList';
import { db } from '@/firebase/firebase';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
} from '@chakra-ui/react';
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface IForm {
  email: string;
  password: string;
  checkPassword: string;
  friend: string;
}

interface IFriend {
  name?: string;
  email?: string;
  image?: string;
}
const customTabProps = {
  bgColor: 'gray.100',
  _selected: { color: 'white', bg: 'gray.600' },
  fontSize: '18px',
  fontWeight: 'bold',
};

const buttonProps = {
  display: 'block',
  w: '140px',
  h: '40px',
  fontSize: '20px',
  justifyContent: 'center',
  margin: '0 auto',
};

function userInfo() {
  const { data } = useSession();
  const [friend, setFriend] = useState<IFriend>({});
  const [match, setMatch] = useState<boolean>(true);
  const [hide, setHide] = useState<boolean>(true);
  const [checkHide, setCheckHide] = useState<boolean>(true);
  const { control, getValues, setValue } = useForm<IForm>();
  const toast = useToast();
  const mailDisclosure = useDisclosure();
  const modalDisclosure = useDisclosure();
  const [friendNameList, setFriendNameList] = useState<string[]>([]);
  const [friendEmailList, setFriendEmailList] = useState<string[]>([]);
  const [friendImageList, setFriendImageList] = useState<string[]>([]);
  const [trigger, setTrigger] = useState(0);

  const onClickTrigger = () => {
    setTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (match === false) {
      toast({
        title: '존재하지 않는 유저입니다.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [match]);

  useEffect(() => {
    const asyncFunction = async () => {
      if (data?.user) {
        const snapshotMine = await getDoc(
          doc(db, 'Friends', data?.user?.email!),
        );
        const prevName = snapshotMine.data()!.name;
        const prevEmail = snapshotMine.data()!.email;
        const prevImage = snapshotMine.data()!.image;
        setFriendNameList(prevName);
        setFriendEmailList(prevEmail);
        setFriendImageList(prevImage);
      }
    };
    asyncFunction();
  }, [trigger]);

  // TODO 친구 요청 수락을 받아야 친구가 맺이지도록, Message 컬렉션 사용 & Drawer 사용
  const onAddFriend = async () => {
    const length = Object.keys(friend).length;
    if (length > 0 && friend.name) {
      const name =
        friend.name.length > 3 ? friend.name.slice(0, 4) : friend.name;

      // 내 친구 목록 불러오기
      const snapshotMine = await getDoc(doc(db, 'Friends', data?.user?.email!));

      // 상대 친구 목록
      const snapshotFriend = await getDoc(doc(db, 'Friends', friend.email!));

      // 내 친구 목록에 업데이트
      const prevName = snapshotMine.data()!.name;
      const prevEmail = snapshotMine.data()!.email;
      const prevImage = snapshotMine.data()!.image;

      if (prevEmail.length > 0 && prevEmail.includes(friend.email)) {
        return toast({
          title: '이미 추가한 친구입니다.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }

      await updateDoc(doc(db, 'Friends', data?.user?.email!), {
        name: prevName.length > 0 ? [...prevName, friend.name] : [friend.name],
        email:
          prevName.length > 0 ? [...prevEmail, friend.email] : [friend.email],
        image:
          prevName.length > 0 ? [...prevImage, friend.image] : [friend.image],
      });

      // 상대의 친구 요청 목록 업데이트
      const prevFriendName = snapshotFriend.data()!.name;
      const prevFriendEmail = snapshotFriend.data()!.email;
      const prevFriendImage = snapshotFriend.data()!.image;
      await updateDoc(doc(db, 'Friends', friend.email!), {
        name:
          prevFriendName.length > 0
            ? [...prevFriendName, data?.user?.name]
            : [data?.user?.name],
        email:
          prevFriendName.length > 0
            ? [...prevFriendEmail, data?.user?.email]
            : [data?.user?.email],
        image:
          prevFriendName.length > 0
            ? [...prevFriendImage, data?.user?.image]
            : [data?.user?.image],
      });
      toast({
        title: `${name} - ${friend.email}님을 친구 목록에 추가했습니다.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } else {
      return toast({
        title: '검색을 먼저 해주세요.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const onSearch = async () => {
    setMatch(true);
    setFriend({});
    if (!getValues('friend')) {
      return toast({
        title: '입력해주세요!',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
    const q = query(
      collection(db, 'Users'),
      where('email', '==', getValues('friend')),
    );
    const snapshot = await getDocs(q);
    if (snapshot.docs.length) {
      snapshot.forEach((doc) => {
        const { name, email, image } = doc.data();
        const data: IFriend = { name, email, image };
        setFriend(data);
      });
    } else {
      setMatch(false);
    }
    setValue('friend', '');
  };

  const onClickInfo = () => {
    toast({
      title: '구글로 로그인하였습니다. \n정보 수정이 불가능합니다.',
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box p="48px 12px">
      <Box position="absolute" top="2px" right="4px">
        <EmailIcon fontSize="34px" onClick={mailDisclosure.onOpen} />
      </Box>
      <Box position="absolute" top="-2px" right="2px">
        <CircleIcon color="red.500" />
      </Box>
      {/* Drawer */}
      <Drawer
        isOpen={mailDisclosure.isOpen}
        placement="right"
        onClose={mailDisclosure.onClose}
      >
        <DrawerOverlay />
        <DrawerContent maxW="220px">
          <DrawerHeader>YoKHURoute</DrawerHeader>
          <DrawerBody p={4}>Welcome To YoKHURoute!</DrawerBody>
        </DrawerContent>
      </Drawer>
      <Tabs isFitted variant="soft-rounded">
        <TabList w="100%" h="50px" gap={2}>
          <Tab
            {...customTabProps}
            onClick={() => {
              onClickTrigger();
            }}
          >
            내정보
          </Tab>
          <Tab {...customTabProps}>정보수정</Tab>
          <Tab {...customTabProps}>친구찾기</Tab>
        </TabList>
        <Heading textAlign="center" mt="12px">
          {data?.user?.name && data?.user?.name.length > 3
            ? data?.user?.name.slice(0, 4)
            : data?.user?.name}
        </Heading>
        <Avatar
          bg="gray.400"
          size="2xl"
          position="relative"
          left="50%"
          top="10px"
          transform="translate(-50%, 0)"
          src={data?.user?.image!}
        />
        <TabPanels mt="10px">
          {/* 내정보 */}
          <TabPanel>
            <Card
              align="center"
              w="100%"
              margin="0 auto"
              mt="24px"
              boxShadow="0 2px 16px rgba(0, 0, 0, 0.12)"
            >
              <CardHeader>
                <Heading size="lg">{data?.user?.email!}</Heading>
                <Text textAlign="center" mt="6px" fontSize="18px">
                  친구목록
                </Text>
              </CardHeader>
              <Box w="90%" h="4px" bgColor="blue.400" borderRadius="12px" />
              <CardBody>
                <VStack justifyContent="space-between">
                  {friendNameList.map((name, i) => (
                    <Box key={i} w="100%">
                      <HStack spacing={4}>
                        <Avatar size="sm" src={friendImageList[i]} />
                        <Text fontSize="20px">
                          {name.length > 3 ? name.slice(0, 4) : name}
                        </Text>
                        <Text fontSize="15px">{friendEmailList[i]}</Text>
                      </HStack>
                      <Box w="100%" h="2px" bgColor="gray.200" mt="2px" />
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
            <HStack mt="24px">
              <Button
                {...buttonProps}
                colorScheme="orange"
                onClick={modalDisclosure.onOpen}
              >
                로그아웃
              </Button>
              {/* Modal */}
              <Modal
                onClose={modalDisclosure.onClose}
                isOpen={modalDisclosure.isOpen}
                isCentered
                size="xs"
              >
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>로그아웃 할까요?</ModalHeader>
                  <ModalCloseButton />
                  <ModalFooter gap={2}>
                    <Button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      네
                    </Button>
                    <Button
                      onClick={modalDisclosure.onClose}
                      colorScheme="orange"
                    >
                      아니요
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </HStack>
            <Text mt="48px" textAlign="center" color="gray.400" fontSize="18px">
              친구 목록이 안뜬다면
              <br /> 탭을 한 번 바꿔주세요!
            </Text>
          </TabPanel>
          {/* 정보수정 */}
          <TabPanel>
            <VStack gap={1} mt="32px">
              <CommonInput
                type="text"
                name="email"
                control={control}
                placeholder="이메일"
                icons={<EmailIcon />}
              />
              <CommonInput
                type={hide ? 'password' : 'text'}
                name="password"
                control={control}
                placeholder="비밀번호"
                icons={hide ? <KeyIcon /> : <EyeCloseIcon />}
                myChange={() => {
                  setHide((prev) => !prev);
                }}
              />
              <CommonInput
                type={checkHide ? 'password' : 'text'}
                name="checkPassword"
                control={control}
                placeholder="비밀번호확인"
                icons={checkHide ? <EyeIcon /> : <EyeCloseIcon />}
                myChange={() => {
                  setCheckHide((prev) => !prev);
                }}
              />
            </VStack>
            <Button
              {...buttonProps}
              colorScheme="purple"
              mt="48px"
              onClick={onClickInfo}
            >
              수정하기
            </Button>
          </TabPanel>
          {/* 친구찾기 */}
          <TabPanel>
            <VStack mt="86px" gap={6}>
              <InputGroup>
                <CommonInput
                  control={control}
                  name="friend"
                  type="string"
                  icons={<EmailIcon />}
                  placeholder="이메일"
                />
                <InputRightElement w="4rem">
                  <Button w="100%" onClick={onSearch}>
                    검색
                  </Button>
                </InputRightElement>
              </InputGroup>
              {Object.keys(friend).length ? (
                <UserList
                  name={friend.name}
                  email={friend.email}
                  image={friend.image}
                />
              ) : (
                '해당 유저가 없습니다.'
              )}
              <Button
                colorScheme="purple"
                mt="20px"
                w="140px"
                h="40px"
                fontSize="20px"
                onClick={onAddFriend}
              >
                친구요청
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
export default userInfo;
