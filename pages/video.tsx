import { EndCallIcon, RefreshIcon, VideoCallIcon } from '@/Icons/icons';
import {
  Avatar,
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalFooter,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useRef } from 'react';
import { db } from '@/firebase/firebase';
import { getDoc, doc } from 'firebase/firestore';

function video() {
  let connectedUser: any;
  let stream: MediaStream;
  let socket: WebSocket;
  let yourConnection: RTCPeerConnection;
  const { data } = useSession();
  const yours = useRef<HTMLVideoElement>(null);
  const theirs = useRef<HTMLVideoElement>(null);
  const [friendNameList, setFriendNameList] = useState<string[]>([]);
  const [friendEmailList, setFriendEmailList] = useState<string[]>([]);
  const [friendImageList, setFriendImageList] = useState<string[]>([]);
  const [trigger, setTrigger] = useState(0);
  const modalDisclosure = useDisclosure();
  const [callName, setCallName] = useState<string>();
  const [callEmail, setCallEmail] = useState<string>();
  const [con, setCon] = useState<RTCPeerConnection>();

  function checkConnected() {
    if (
      // yourConnection === undefined ||
      // yourConnection.connectionState !== 'connected'
      con === undefined ||
      con.connectionState !== 'connected'
    ) {
      return false;
    }
    return true;
  }

  function onLogin(success: boolean) {
    if (success === false) {
      console.log('이메일 중복');
    } else {
      console.log('시작');
      startConnetion();
    }
  }

  function onOffer(offer: RTCSessionDescription, name: any) {
    connectedUser = name;
    if (con) {
      con.setRemoteDescription(new RTCSessionDescription(offer));
      con
        .createAnswer()
        .then((answer) => {
          con.setLocalDescription(answer);
          _send({
            type: 'answer',
            answer: answer,
          });
        })
        .catch((error) => {
          alert('An error has occurred.');
        });
    }
    // yourConnection.setRemoteDescription(new RTCSessionDescription(offer));
    // yourConnection
    //   .createAnswer()
    //   .then((answer) => {
    //     yourConnection.setLocalDescription(answer);
    //     _send({
    //       type: 'answer',
    //       answer: answer,
    //     });
    //   })
    //   .catch((error) => {
    //     alert('An error has occurred.');
    //   });
  }

  async function onAnswer(answer: RTCSessionDescription) {
    // await yourConnection.setRemoteDescription(
    if (con) {
      await con.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  function onCandidate(candidate: any) {
    if (con) {
      con.addIceCandidate(new RTCIceCandidate(candidate));
    }
    // yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function onLeave() {
    connectedUser = null;
    theirs.current!.srcObject = null;

    if (con) {
      con.close();

      con.onicecandidate = null;
      con.ontrack = null;

      setupPeerConnection(stream);
    }

    // yourConnection.close();

    // yourConnection.onicecandidate = null;
    // yourConnection.ontrack = null;

    // setupPeerConnection(stream);
  }

  function _send(message: any) {
    if (connectedUser) {
      message.name = connectedUser;
    }

    if (socket) {
      socket.send(JSON.stringify(message));
    }
  }

  function startConnetion() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((myStream) => {
        stream = myStream;
        if (yours.current) {
          yours.current.srcObject = stream;
        }
        setupPeerConnection(stream);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const setupPeerConnection = (stream: MediaStream) => {
    const config = {
      iceServers: [
        { urls: ['stun:stun.kinesisvideo.ap-northeast-2.amazonaws.com:443'] },
        {
          urls: ['turn:35.247.51.87:3478?transport=tcp'],
          username: 'username',
          credential: 'password',
        },
      ],
    };
    // yourConnection = new RTCPeerConnection(config);
    setCon(new RTCPeerConnection(config));
    //!
    if (con) {
      con.onicecandidate = (event) => {
        if (event.candidate) {
          _send({
            type: 'candidate',
            candidate: event.candidate,
          });
        }
      };

      con.addTrack(stream.getTracks()[0]);
      con.ontrack = (event) => {
        const remoteMediaStream = new MediaStream();
        remoteMediaStream.addTrack(event.track);
        if (theirs.current) {
          theirs.current.srcObject = remoteMediaStream;
        }
      };
    }
    // yourConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     _send({
    //       type: 'candidate',
    //       candidate: event.candidate,
    //     });
    //   }
    // };

    // yourConnection.addTrack(stream.getTracks()[0]);
    // yourConnection.ontrack = (event) => {
    //   const remoteMediaStream = new MediaStream();
    //   remoteMediaStream.addTrack(event.track);
    //   if (theirs.current) {
    //     theirs.current.srcObject = remoteMediaStream;
    //   }
    // };
  };

  const startPeerConnection = (user: string) => {
    connectedUser = user;

    if (con) {
      console.log('yuo', con);
      con
        .createOffer()
        .then((offer) => {
          console.log('offer', offer);
          _send({
            type: 'offer',
            offer: offer,
          });
          console.log('sending offer to Remote,', offer);
          con.setLocalDescription(offer);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log('sdf');
    }

    // if (yourConnection) {
    //   console.log('yuo', yourConnection);
    //   yourConnection
    //     .createOffer()
    //     .then((offer) => {
    //       _send({
    //         type: 'offer',
    //         offer: offer,
    //       });
    //       console.log('sending offer to Remote,', offer);
    //       yourConnection.setLocalDescription(offer);
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    // } else {
    //   console.log('sdf');
    // }
  };

  const onClickTrigger = () => {
    setTrigger((prev) => prev + 1);
  };

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

  useEffect(() => {
    socket = new WebSocket('wss://eunnhodev.site/ws');

    socket.onopen = function () {
      console.log('Connected');
      if (data?.user) {
        _send({
          type: 'login',
          name: data?.user.email,
        });
      }
    };

    socket.onmessage = function (message) {
      console.log('Got message', message.data);

      var data = JSON.parse(message.data);
      switch (data.type) {
        case 'login':
          onLogin(data.success);
          break;
        case 'offer':
          onOffer(data.offer, data.name);
          break;
        case 'answer':
          onAnswer(data.answer);
          break;
        case 'candidate':
          onCandidate(data.candidate);
          break;
        case 'leave':
          onLeave();
          break;
        default:
          break;
      }
    };

    socket.onerror = function (error) {
      console.log('Got error', error);
    };
  }, [data]);

  const onEndVideo = () => {
    _send({
      type: 'leave',
    });

    onLeave();
  };

  return (
    <Box p="20px 24px" m="0 auto">
      <Box
        w="250px"
        h="250px"
        border="1px solid red"
        m="0 auto"
        position="relative"
      >
        <video
          id="theirs"
          autoPlay
          playsInline
          ref={theirs}
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid black',
          }}
        />
        <video
          id="yours"
          autoPlay
          playsInline
          ref={yours}
          style={{
            width: '75px',
            height: '75px',
            position: 'absolute',
            top: '0',
            right: '0',
            border: '1px solid blue',
          }}
        />
      </Box>
      {/* startPeerConnection(friendEmailList[i]); */}
      <Card
        align="center"
        w="100%"
        margin="0 auto"
        mt="24px"
        boxShadow="0 2px 16px rgba(0, 0, 0, 0.12)"
      >
        <CardHeader>
          <Text textAlign="center" mt="6px" fontSize="18px">
            친구목록
          </Text>
        </CardHeader>
        <CardBody pt="0" mt="0">
          <VStack justifyContent="space-between">
            {friendNameList.map((name, i) => (
              <Box key={i} w="100%">
                <HStack spacing={4} justify="center">
                  <Avatar size="sm" src={friendImageList[i]} />
                  <Text fontSize="14px">
                    {name.length > 3 ? name.slice(0, 4) : name}
                  </Text>
                  <Text fontSize="15px">{friendEmailList[i]}</Text>
                  <VideoCallIcon
                    w="20px"
                    h="32px"
                    onClick={() => {
                      modalDisclosure.onOpen();
                      setCallName(name);
                      setCallEmail(friendEmailList[i]);
                    }}
                  />
                </HStack>
                <Box w="100%" h="2px" bgColor="gray.200" mt="2px" />
                <Modal
                  onClose={modalDisclosure.onClose}
                  isOpen={modalDisclosure.isOpen}
                  isCentered
                  size="xs"
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>{callName}님께 화상통화를 걸까요?</ModalHeader>
                    <ModalCloseButton />
                    <ModalFooter gap={2}>
                      <Button
                        onClick={() => {
                          console.log('ca', callEmail);
                          if (callEmail) {
                            console.log(callEmail);
                            startPeerConnection(callEmail);
                          }
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
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>
      <HStack justify="center" mt="24px">
        <Button
          display="block"
          position="relative"
          borderRadius="100%"
          colorScheme="red"
          onClick={onEndVideo}
          w="48px"
          h="48px"
          isDisabled={!checkConnected()}
        >
          <EndCallIcon
            color="white"
            w="24px"
            h="24px"
            position="absolute"
            bottom="12px"
            right="12px"
            _active={{
              color: 'gray.200',
            }}
            _hover={{
              color: 'gray.200',
            }}
          />
        </Button>
        <Button
          onClick={onClickTrigger}
          display="block"
          position="relative"
          borderRadius="100%"
          colorScheme="facebook"
          w="48px"
          h="48px"
        >
          <RefreshIcon
            w="32px"
            h="32px"
            position="absolute"
            bottom="8px"
            right="8px"
            color="white"
            _active={{
              color: 'gray.200',
            }}
            _hover={{
              color: 'gray.200',
            }}
          />
        </Button>
      </HStack>
      <Text mt="32px" textAlign="center" color="gray.400" fontSize="18px">
        친구목록이 뜨지 않는다면
        <br />
        새로고침 버튼을 눌러보세요!
      </Text>
    </Box>
  );
}

export default video;
