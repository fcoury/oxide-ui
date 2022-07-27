import { Accordion } from '@chakra-ui/react';
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import Stage from './Stage';

export default function Pipeline() {
  const [stages, setStages] = useState([
    { name: '$match', value: '{}', expanded: false },
    { name: '$group', value: '{}', expanded: false },
    { name: '$project', value: '{}', expanded: false },
    { name: '$sort', value: '{}', expanded: false },
  ]);

  /** Events */
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newStages = [...stages];
    const [removed] = newStages.splice(result.source.index, 1);
    newStages.splice(result.destination.index, 0, removed);
    setStages(newStages);
  };

  // updates the expanded setting on stages from an array of expanded indexes
  const onExpandedChange = (expanded: number[]) => {
    const newStages = [...stages];
    newStages.forEach((stage, i) => {
      stage.expanded = expanded.includes(i);
    });
    setStages(newStages);
  };

  /** Elements */
  const stagesElements = stages.map((stage, index) => (
    <Stage
      key={index}
      index={index}
      name={stage.name}
      value={stage.value}
      onChange={(value) => {
        setStages([
          ...stages.slice(0, index),
          { ...stage, value },
          ...stages.slice(index + 1),
        ]);
      }}
    />
  ));

  const expanded = stages
    .map((stage, index) => (stage.expanded ? index : -1))
    .filter((n) => n !== -1);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Accordion
            {...provided.droppableProps}
            ref={provided.innerRef}
            index={expanded}
            onChange={onExpandedChange}
            reduceMotion
            allowMultiple
          >
            {stagesElements}
          </Accordion>
        )}
      </Droppable>
    </DragDropContext>
  );
}
