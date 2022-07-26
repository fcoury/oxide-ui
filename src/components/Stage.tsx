import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  useColorMode,
} from '@chakra-ui/react';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { formatCode, parseObj } from '../lib/utils';

interface StageProps {
  name: string;
  onChange: (value: string) => void;
}

export default function Stage(props: StageProps) {
  const { name } = props;
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(true);
  const { colorMode } = useColorMode();

  /** Effects */
  useEffect(() => {
    try {
      // JSON.parse(value);
      const obj = parseObj(value);
      console.log('obj', obj);
      props.onChange(JSON.stringify(obj));
      setValid(true);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log('Found error', e);
      }
      setValid(false);
    }
  }, [value]);

  // useEffect(() => {
  //   setValue(props.value);
  // }, [props.value]);

  /** Events */
  const onChange = _.debounce((str) => {
    setValue(str);
  }, 250);

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
          extensions={[json()]}
          onChange={onChange}
          onBlur={onBlur}
        />
      </AccordionPanel>
    </AccordionItem>
  );
}
