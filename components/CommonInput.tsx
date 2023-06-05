import { Input, InputGroup, InputLeftAddon } from '@chakra-ui/react';
import React, { MouseEventHandler } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
  useController,
} from 'react-hook-form';

type TControl<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  rules?: Omit<
    RegisterOptions<T>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  icons?: JSX.Element;
  placeholder?: string;
  type: string;
  errorMessage?: string;
  valueProp?: string;
  myChange?: MouseEventHandler;
};

function CommonInput({
  control,
  name,
  rules,
  placeholder,
  type,
  myChange,
  icons,
}: TControl<any>) {
  const {
    field: { onChange, onBlur, value },
  } = useController({ name, rules, control });

  return (
    <>
      <InputGroup bgColor="gray.50">
        <InputLeftAddon
          h="40px"
          children={icons}
          outline="none"
          onClick={myChange}
        />
        <Input
          color="black"
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => {
            onChange(e);
          }}
          onBlur={onBlur}
          width="100%"
          borderRadius="4px"
          border="1px solid gray.500"
          fontSize="16px"
          outline="none"
        />
      </InputGroup>
    </>
  );
}

export default CommonInput;
