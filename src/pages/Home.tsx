import { Box, Button, Grid, GridItem, useColorMode } from '@chakra-ui/react';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import CodeMirror from '@uiw/react-codemirror';
import { useState } from 'react';

export default function Home() {
  const { colorMode } = useColorMode();
  const [match, setMatch] = useState('{}');
  const [query, setQuery] = useState('SELECT * FROM table');

  return (
    <Box p={5}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%">
          <CodeMirror
            value={match}
            height="calc(40vh)"
            theme={colorMode}
            extensions={[json()]}
          />
        </GridItem>
        <GridItem w="100%">
          <CodeMirror
            value={query}
            height="calc(40vh)"
            theme={colorMode}
            extensions={[sql()]}
          />
        </GridItem>
      </Grid>
      <Box mt={5}>
        <Button colorScheme="gray">Run</Button>
        <Button colorScheme="gray" ml={2}>
          Clear
        </Button>
      </Box>
    </Box>
  );
}
