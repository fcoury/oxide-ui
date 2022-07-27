import {
  Badge,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
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

  console.log('data', data);

  /** Data */
  const fields = _(data)
    .flatMap((row) => _.keys(row))
    .uniq()
    .value();

  console.log('fields', fields);

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
              <Badge mr={2}>ObjectID</Badge>
              {objValue}
            </Td>
          );
        } else if (objKey === '$d') {
          return (
            <Td key={key}>
              <Badge>Date</Badge>
              {objValue}
            </Td>
          );
        } else {
          return <Td key={key}>{JSON.stringify(val)}</Td>;
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
