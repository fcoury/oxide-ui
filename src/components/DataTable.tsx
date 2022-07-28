import {
  Badge,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import _ from 'lodash';

interface Row {
  [key: string]: string | number | Row;
}

interface TableProps {
  data: Row[];
}

export default function DataTable(props: TableProps) {
  const { data } = props;

  if (!data || _.isEmpty(data)) return null;

  /** Data */
  const fields = _(data)
    .flatMap((row) => _.keys(row))
    .uniq()
    .value();

  /** Elements */
  const headers = fields.map((f) => <Th key={f}>{f}</Th>);
  const rows = data.map((row, i) => {
    const cells = fields.map((f) => {
      const val = row[f];
      const key = `${i}-${f}`;
      if (_.isObject(val)) {
        const objKey = Object.keys(val)[0];
        const objValue = val[objKey] as string;
        if (objKey === '$o') {
          return (
            <Td key={key}>
              <Badge mr={2} fontSize="8px">
                ObjectID
              </Badge>
              {objValue}
            </Td>
          );
        } else if (objKey === '$d') {
          const dateVal = new Date(objValue);
          return (
            <Td key={key}>
              <Badge mr={2} fontSize="8px">
                ISODate
              </Badge>
              {dateVal.toISOString()}
            </Td>
          );
        } else {
          return (
            <Td key={key}>
              <Text noOfLines={1} maxW="sm">
                <Badge mr={2} fontSize="8px">
                  OBJ
                </Badge>
                <code>{JSON.stringify(val)}</code>
              </Text>
            </Td>
          );
        }
      } else if (_.isNumber(val)) {
        return (
          <Td key={key} isNumeric>
            {val}
          </Td>
        );
      } else {
        return <Td key={key}>{val}</Td>;
      }
    });
    return <Tr key={i}>{cells}</Tr>;
  });

  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <TableCaption>{rows.length} rows</TableCaption>
        <Thead>
          <Tr>{headers}</Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </TableContainer>
  );
}
