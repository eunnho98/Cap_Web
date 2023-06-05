import React, { useEffect, useMemo, useState } from 'react';
import { Text, keyframes } from '@chakra-ui/react';

// 글자 입력 속도
const speed = 100;

// 딜레이 기능
const wait = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

const cursor = keyframes`
from { border-right: 2px solid #111; }
to { border-right: 2px solid #888; }
`;

function ShaderText(props: any) {
  const textArr: string[] = useMemo(() => props.children.split(''), []); // 입력될 글자 모음
  const [str, setStr] = useState('');
  const [idx, setIdx] = useState(0);
  const animation = `${cursor} 0.9s infinite ease-in`;

  const typingText = async () => {
    for (const ch of textArr) {
      await wait(speed);
      setStr((prev) => (prev = prev + ch));
      console.log(str);
    }
    await wait(2000);
    remove();
  };

  const remove = async () => {
    const arrCopy = [...textArr];
    while (arrCopy.length) {
      await wait(speed);
      arrCopy.pop();
      setStr(arrCopy.join(''));
    }
    typingText();
  };
  useEffect(() => {
    typingText();
  }, []);
  return (
    <Text
      {...props}
      _after={{
        marginLeft: '0.6rem',
        content: `""`,
        borderRight: '2px solid #777',
        animation: `${animation}`,
      }}
    >
      {str}
    </Text>
  );
}

export default ShaderText;
