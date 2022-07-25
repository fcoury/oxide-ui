import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';

export default function App() {
  return (
    <Box h="calc(100vh)">
      <NavBar />
      <Outlet />
    </Box>
  );
}
