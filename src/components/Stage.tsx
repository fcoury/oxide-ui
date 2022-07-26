import { DragHandleIcon } from '@chakra-ui/icons';
import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  useColorMode,
} from '@chakra-ui/react';
import { javascript } from '@codemirror/lang-javascript';
import CodeMirror from '@uiw/react-codemirror';
import _ from 'lodash';
import { FocusEvent, useCallback, useEffect, useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { formatCode, parseObj } from '../lib/utils';

interface StageProps {
  name: string;
  value: string;
  index: number;
  enabled: boolean;
  onChange: (value: string) => void;
  onEnableToggle: (value?: boolean) => void;
}

export default function Stage(props: StageProps) {
  const { name, index } = props;
  const [enabled, setEnabled] = useState(props.enabled);
  const [changed, setChanged] = useState(false);
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
    setValue(props.value);
  }, [props.value]);

  useEffect(() => {
    setEnabled(props.enabled);
  }, [props.enabled]);

  /** Events */
  const onChange = useCallback(
    _.debounce((str) => {
      setChanged(true);
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

      if (changed) {
        if (!enabled) {
          props.onEnableToggle(true);
        }
        setChanged(false);
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
    <Draggable
      key={`drag-${index}`}
      draggableId={`drag-${index}`}
      index={index}
    >
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Checkbox
                  mr={2}
                  isChecked={enabled}
                  onChange={() => props.onEnableToggle()}
                />
                <Box
                  flex="1"
                  textAlign="left"
                  color={textColor}
                  fontWeight={fontWeight}
                >
                  <code>{name}</code> Stage
                </Box>
                <AccordionIcon />
                <div {...provided.dragHandleProps}>
                  <DragHandleIcon w={3} h={3} color="gray.500" />
                </div>
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
        </div>
      )}
    </Draggable>
  );
}
