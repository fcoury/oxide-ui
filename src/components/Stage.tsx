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
import { useCallback, useEffect, useState } from 'react';
import { formatCode, parseObj } from '../lib/utils';

interface StageProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function Stage(props: StageProps) {
  const { name } = props;
  const [value, setValue] = useState(props.value);
  const [valid, setValid] = useState(true);
  const { colorMode } = useColorMode();

  /** Effects */
  useEffect(() => {
    try {
      // JSON.parse(value);
      console.log('value changed', value);
      parseObj(value);
      console.log('calling onChange', value);
      props.onChange(value);
      setValid(true);
    } catch (e) {
      console.error('Error trying to parse object', e);
      if (e instanceof SyntaxError) {
        console.log('Found error', e);
      }
      setValid(false);
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

  const onBlur = () => {
    // setValue(JSON.stringify(JSON.parse(value), null, 2));
    setValue(formatCode(value));
    // setValue()
  };

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
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
      </AccordionPanel>
    </AccordionItem>
  );
}
