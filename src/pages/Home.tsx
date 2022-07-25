import {
  Box,
  Button,
  Grid,
  GridItem,
  Select,
  SimpleGrid,
  useColorMode,
} from '@chakra-ui/react';
import { json } from '@codemirror/lang-json';
import CodeMirror from '@uiw/react-codemirror';
import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function Home() {
  const { colorMode } = useColorMode();
  const [match, setMatch] = useState('{}');
  const [query, setQuery] = useState(`SELECT _jsonb #- '{age_sum}'
FROM (
	SELECT
		row_to_json(s_wrap)::jsonb AS _jsonb
	FROM (
		SELECT
			_jsonb->'city' AS _id,
			SUM((
        CASE WHEN (_jsonb->'age' ? '$f')
        THEN (_jsonb->'age'->>'$f')::numeric
        ELSE (_jsonb->'age')::numeric END
      )) AS age_sum
		FROM (
			SELECT *
      FROM "db_test"."test_e4a3258c-29ad-49e0-aa41-327750e568e4"
      WHERE _jsonb->'pick' = 'true'
		) AS s_group
		GROUP BY _id
	) AS s_wrap
) AS s_project;
  `);

  return (
    <Box p={5}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%">
          <SimpleGrid columns={2} spacing={2} mb={2}>
            <Box>
              <Select size="xs">
                <option value="database 1">database 1</option>
                <option value="database 2">database 2</option>
                <option value="database 3">database 3</option>
              </Select>
            </Box>
            <Box>
              <Select size="xs">
                <option value="collection 1">collection 1</option>
                <option value="collection 2">collection 2</option>
                <option value="collection 3">collection 3</option>
              </Select>
            </Box>
          </SimpleGrid>
          <CodeMirror
            value={match}
            height="calc(40vh)"
            theme={colorMode}
            extensions={[json()]}
          />
        </GridItem>
        <GridItem w="100%">
          <Box h={'26px'} mb={2}>
            Generated Query
          </Box>
          <SyntaxHighlighter
            language="sql"
            style={colorMode === 'dark' ? a11yDark : a11yLight}
            customStyle={{ height: 'calc(40vh)', fontSize: '14px' }}
            wrapLongLines={true}
          >
            {query}
          </SyntaxHighlighter>
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
