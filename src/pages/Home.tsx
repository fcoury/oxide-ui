import { Box, Grid, GridItem, Textarea } from '@chakra-ui/react';

export default function Home() {
  return (
    <Box p={10}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem w="100%">
          <Textarea h="calc(50vh)"></Textarea>
        </GridItem>
        <GridItem w="100%">
          <Textarea h="calc(50vh)"></Textarea>
        </GridItem>
      </Grid>
    </Box>
  );
}
