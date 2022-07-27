import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  useColorMode,
} from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import _ from 'lodash';
import { FocusEvent, useCallback, useEffect, useState } from 'react';
import { formatCode, parseObj } from '../lib/utils';

interface StageProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function Stage(props: StageProps) {
  const { name } = props;
  const [value, setValue] = useState(props.value);
  const [error, setError] = useState('');
  const { colorMode } = useColorMode();

  /** Effects */
  useEffect(() => {
    try {
      parseObj(value);
      props.onChange(value);
      setError('');
    } catch (e: any) {
      // setError(e.message);
    }
  }, [value]);

  useEffect(() => {
    console.log('props.value changed', props.value);
    setValue(props.value);
  }, [props.value]);

  /** Events */
  const onChange = useCallback(
    _.debounce((str) => {
      setValue(str);
    }, 250),
    [],
  );

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    try {
      if (_.isEmpty(value)) {
        setValue('{}');
        return;
      }

      parseObj(value);
      setValue(formatCode(value));
    } catch (error: any) {
      setError(error.message);
      event.preventDefault();
      event.target.focus();
    }
  };

  /** Attributes */
  const textColor = error
    ? 'red.500'
    : _.isEmpty(value) || value.trim() === '{}'
    ? 'gray.500'
    : colorMode === 'dark'
    ? 'yellow.200'
    : 'blue.900';

  const fontWeight = error
    ? 'bold'
    : _.isEmpty(value) || value.trim() === '{}'
    ? ''
    : colorMode === 'dark'
    ? 'normal'
    : 'bold';

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box
            flex="1"
            textAlign="left"
            color={textColor}
            fontWeight={fontWeight}
          >
            <code>{name}</code> Stage
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel>
        <CodeMirror
          value={value}
          height="calc(20vh)"
          theme={colorMode}
          extensions={[javascript()]}
          onChange={onChange}
          onBlur={onBlur}
        />
        {error && (
          <Box fontSize="0.8em" color="red.500" p={2}>
            {error}
          </Box>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
}
