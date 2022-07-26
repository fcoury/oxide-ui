import {
  Accordion,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Select,
  SimpleGrid,
  useColorMode,
} from '@chakra-ui/react';
import { format } from 'cl-sql-formatter';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Stage from '../components/Stage';
import { parseObj } from '../lib/utils';

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

export default function Home() {
  const { colorMode } = useColorMode();
  const [match, setMatch] = useState('{}');
  const [group, setGroup] = useState('{}');
  const [project, setProject] = useState('{}');
  const [sort, setSort] = useState('{}');
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
    setError('');
    convert();
  }, [match, group, project, sort]);
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
    let pipeline = [];

    pipeline.push({
      $match: parseObj(match),
    });

    if (group !== '{}' && !_.isEmpty(group)) {
      pipeline.push({
        $group: parseObj(group),
      });
    }

    if (project !== '{}' && !_.isEmpty(project)) {
      pipeline.push({
        $project: parseObj(project),
      });
    }

    if (sort !== '{}' && !_.isEmpty(sort)) {
      pipeline.push({
        $sort: parseObj(sort),
      });
    }

    const data: any = await post('/api/convert', {
      database,
      collection,
      pipeline,
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
  const onRun = async () => {
    const { rows } = await post('/api/run', { query });
    setData(rows);
  };

  const onClear = async () => {
    setMatch('{}');
    setGroup('{}');
    setProject('{}');
    setSort('{}');
    setData([]);
  };

  /** Properties */
  const databaseOptions = databases.map((db) => (
    <option key={db} value={db}>
      {db}
    </option>
  ));

  const collectionOptions = collections.map((db) => (
    <option key={db} value={db}>
      {db}
    </option>
  ));

  console.log('group', group);

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
            <Stage name="$match" value={match} onChange={setMatch} />
            <Stage name="$group" value={group} onChange={setGroup} />
            <Stage name="$project" value={project} onChange={setProject} />
            <Stage name="$sort" value={sort} onChange={setSort} />
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
            <Flex>
              <Center>
                <Button colorScheme="gray" onClick={onRun}>
                  Run
                </Button>
                <Button colorScheme="gray" onClick={onClear} ml={2}>
                  Clear
                </Button>
              </Center>
              {error && (
                <Center ml={2} textAlign="right" color="red.500">
                  {error}
                </Center>
              )}
            </Flex>
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
