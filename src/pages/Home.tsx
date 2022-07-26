import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import { format } from 'sql-formatter';

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
  const [group, setGroup] = useState('{}');
  const [valid, setValid] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [collections, setCollections] = useState([]);
  const [database, setDatabase] = useState('');
  const [collection, setCollection] = useState('');
  const [data, setData] = useState([]);

  /** Effects */
  useEffect(() => {
    convert();
  }, [match, group]);
  useEffect(() => {
    loadDatabases();
  }, []);
  useEffect(() => {
    loadCollections();
  }, [database]);
  useEffect(() => {
    convert();
  }, [collection]);

  /** API Calls */
  const convert = async () => {
    console.log('database', database);
    console.log('collection', collection);
    const data: any = await post('/api/convert', {
      database,
      collection,
      pipeline: [{ $match: JSON.parse(match) }, { $group: JSON.parse(group) }],
    });
    if (data.error) {
      setError(data.error);
      return;
    }
    setQuery(format(data.sql, { language: 'postgresql' }));
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
    setCollection(collections[0]);
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

  const onGroupChanged = debounce((str) => {
    try {
      setGroup(str);
      JSON.parse(str);
      setValid(true);
    } catch (e) {
      setValid(false);
    }
  }, 250);

  const onRun = async () => {
    const { rows } = await post('/api/run', { query });
    setData(rows);
  };

  const onClear = async () => {
    setMatch('{}');
    setGroup('{}');
    setData([]);
  };

  /** Transformers */
  const formatMatch = () => {
    setMatch(JSON.stringify(JSON.parse(match), null, 2));
  };

  const formatGroup = () => {
    setGroup(JSON.stringify(JSON.parse(group), null, 2));
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
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem w="100%">
          <SimpleGrid columns={2} spacing={2} mb={2}>
            <Box>
              <Select
                size="xs"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              >
                {databaseOptions}
              </Select>
            </Box>
            <Box>
              <Select
                size="xs"
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              >
                {collectionOptions}
              </Select>
            </Box>
          </SimpleGrid>
          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <code>$match</code> Stage
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <CodeMirror
                  value={match}
                  height="calc(20vh)"
                  theme={colorMode}
                  extensions={[json()]}
                  onChange={onMatchChanged}
                  onBlur={formatMatch}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <code>$group</code> Stage
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <CodeMirror
                  value={group}
                  height="calc(20vh)"
                  theme={colorMode}
                  extensions={[json()]}
                  onChange={onGroupChanged}
                  onBlur={formatGroup}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </GridItem>
        <GridItem w="100%">
          <Box h={'26px'} mb={2}>
            Generated Query
          </Box>
          <SyntaxHighlighter
            language="sql"
            style={colorMode === 'dark' ? a11yDark : a11yLight}
            customStyle={{ height: 'calc(60vh)', fontSize: '12px' }}
            wrapLongLines={true}
          >
            {query}
          </SyntaxHighlighter>
          <Box mt={5}>
            <Button colorScheme="gray" onClick={onRun}>
              Run
            </Button>
            <Button colorScheme="gray" onClick={onClear} ml={2}>
              Clear
            </Button>
          </Box>
        </GridItem>
        <GridItem w="100%" overflowX="auto">
          <Box>{data && `${data.length} records`}</Box>
          <pre>{data && JSON.stringify(data, null, 2)}</pre>
        </GridItem>
      </Grid>
    </Box>
  );
}
