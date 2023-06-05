import { Icon } from '@chakra-ui/react';
import { MdEmail, MdKey } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export function EmailIcon(props: any) {
  return <Icon {...props} as={MdEmail} />;
}

export function KeyIcon() {
  return <Icon as={MdKey} />;
}

export function EyeIcon() {
  return <Icon as={FaEye} />;
}

export function EyeCloseIcon() {
  return <Icon as={FaEyeSlash} />;
}

export function CircleIcon(props: any) {
  return (
    <Icon viewBox="0 0 200 200" {...props}>
      <path
        fill="currentColor"
        d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
      />
    </Icon>
  );
}
