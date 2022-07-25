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
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

async function post(url: string, data: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

async function get(url: string) {
  const res = await fetch(url);
  return await res.json();
}

type DebounceFn = (...args: any[]) => void;
const debounce = (fn: DebounceFn, ms = 0) => {
  let timeoutId: number | null = null;
  return function (...args: any[]) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
};

export default function Home() {
  const { colorMode } = useColorMode();
  const [match, setMatch] = useState('{}');
  const [valid, setValid] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [collections, setCollections] = useState([]);
  const [database, setDatabase] = useState('');
  const [collection, setCollection] = useState('');

  /** Effects */
  useEffect(() => {
    convert();
    return;
  }, [match]);
  useEffect(() => {
    loadDatabases();
    return;
  }, []);
  useEffect(() => {
    loadCollections();
    return;
  }, [database]);

  /** API Calls */
  const convert = async () => {
    const data: any = await post('/api/convert', JSON.parse(match));
    if (data.error) {
      setError(data.error);
      return;
    }
    setQuery(data.sql);
  };

  const loadDatabases = async () => {
    let { databases } = await get('/api/databases');
    if (!databases) return;
    const filteredDatabases = databases.filter((db: string) => db !== 'public');
    setDatabases(filteredDatabases);
    setDatabase(filteredDatabases[0]);
  };

  const loadCollections = async () => {
    if (!database) return;
    let { collections } = await get(`/api/databases/${database}/collections`);
    setCollections(collections);
  };

  /** Events */
  const onMatchChanged = debounce((str) => {
    try {
      setMatch(str);
      JSON.parse(str);
      setValid(true);
    } catch (e) {
      setValid(false);
    }
  }, 250);

  const formatMatch = () => {
    setMatch(JSON.stringify(JSON.parse(match), null, 2));
  };

  /** Properties */
  const databaseOptions = databases.map((db) => (
    <option value={db}>{db}</option>
  ));

  const collectionOptions = collections.map((db) => (
    <option value={db}>{db}</option>
  ));

  return (
    <Box p={5}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%">
          <SimpleGrid columns={2} spacing={2} mb={2}>
            <Box>
              <Select size="xs" value={database}>
                {databaseOptions}
              </Select>
            </Box>
            <Box>
              <Select size="xs" value={collection}>
                {collectionOptions}
              </Select>
            </Box>
          </SimpleGrid>
          <CodeMirror
            value={match}
            height="calc(40vh)"
            theme={colorMode}
            extensions={[json()]}
            onChange={onMatchChanged}
            onBlur={formatMatch}
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
