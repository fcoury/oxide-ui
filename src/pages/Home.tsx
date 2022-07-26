import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Select,
  SimpleGrid,
  Spinner,
  useColorMode,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  a11yDark,
  a11yLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import DataTable from '../components/DataTable';
import Pipeline from '../components/Pipeline';
import useStore, { DEFAULT_STAGES, Stage } from '../stores';

export default function Home() {
  const { colorMode } = useColorMode();
  const {
    stages,
    query,
    error,
    databases,
    collections,
    database,
    collection,
    loadingDatabases,
    loadingCollections,
    loadingQuery,
    loadingData,

    setStages,
    setError,
    setDatabase,
    setCollection,
    setData,

    loadDatabases,
    loadCollections,
    convert,
    run,
    data,
  } = useStore();

  /** Effects */
  useEffect(() => {
    setError('');
    convert();
  }, [stages]);
  useEffect(() => {
    loadDatabases();
  }, []);
  useEffect(() => {
    loadCollections();
  }, [database]);
  useEffect(() => {
    convert();
  }, [collection]);

  /** Events */
  const onRun = async () => {
    await run();
  };

  const onPipelineChange = (stages: Stage[]) => {
    setStages(stages);
  };

  const onClear = async () => {
    setStages(DEFAULT_STAGES);
    setData(null);
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

  return (
    <Box p={5}>
      <Grid
        templateColumns={{
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(2, 1fr)',
          xl: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        <GridItem w="100%">
          <SimpleGrid columns={2} spacing={2} mb={2}>
            <Box>
              <Select
                size="xs"
                value={database}
                icon={loadingDatabases ? <Spinner /> : <MdArrowDropDown />}
                disabled={loadingDatabases}
                onChange={(e) => setDatabase(e.target.value)}
              >
                {databaseOptions}
              </Select>
            </Box>
            <Box>
              <Select
                size="xs"
                value={collection}
                icon={loadingCollections ? <Spinner /> : <MdArrowDropDown />}
                disabled={loadingCollections}
                onChange={(e) => setCollection(e.target.value)}
              >
                {collectionOptions}
              </Select>
            </Box>
          </SimpleGrid>
          <Pipeline />
        </GridItem>
        <GridItem w="100%">
          <Box h={'26px'} mb={2}>
            Generated Query
          </Box>
          <SyntaxHighlighter
            language="sql"
            style={colorMode === 'dark' ? a11yDark : a11yLight}
            customStyle={{ height: 'calc(40vh)', fontSize: '12px' }}
            wrapLongLines={true}
          >
            {query}
          </SyntaxHighlighter>
          <Box mt={5}>
            <Flex>
              <Center>
                <Button
                  colorScheme="gray"
                  onClick={onRun}
                  isLoading={loadingData}
                  disabled={loadingQuery}
                >
                  Run
                </Button>
                <Button
                  colorScheme="gray"
                  onClick={onClear}
                  ml={2}
                  disabled={loadingQuery || loadingData}
                >
                  Clear
                </Button>
              </Center>
              {loadingQuery && (
                <Center ml={2} textAlign="right" color="red.500">
                  <Spinner />
                </Center>
              )}
              {error && (
                <Center ml={2} textAlign="right" color="red.500">
                  {error}
                </Center>
              )}
            </Flex>
          </Box>
        </GridItem>
        <GridItem
          w="100%"
          overflowX="auto"
          colSpan={{
            sm: 2,
            md: 2,
            lg: 2,
            xl: 1,
          }}
        >
          <DataTable data={data} loading={loadingData} />
        </GridItem>
      </Grid>
    </Box>
  );
}
