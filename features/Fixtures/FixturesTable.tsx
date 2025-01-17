import {
  forwardRef,
  Table,
  TableBodyProps,
  Tbody,
  Thead,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { ReactSortable } from "react-sortablejs";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FullTeamFixtures,
  SortableFullTeamFixtures,
} from "~/features/Fixtures/fixturesDataTypes";
import FixturesTableHeaderRow from "~/features/Fixtures/FixturesTableHeaderRow";
import FixturesTableRow from "~/features/Fixtures/FixturesTableRow";

const ForwardableTbody = forwardRef<TableBodyProps, "tbody">((props, ref) => {
  return <Tbody ref={ref}>{props.children}</Tbody>;
});

const makeSortedFixturesOrder = (
  sortableFullFixtures: SortableFullTeamFixtures[],
  mode: string,
  gameweek: number,
  compareFactor: -1 | 1
) => {
  return [...sortableFullFixtures]
    .sort((a, b) => {
      const diffA =
        mode === "attack"
          ? a.fixtures[gameweek - 1].attack_difficulty
          : a.fixtures[gameweek - 1].defence_difficulty;
      const diffB =
        mode === "attack"
          ? b.fixtures[gameweek - 1].attack_difficulty
          : b.fixtures[gameweek - 1].defence_difficulty;
      return diffA === diffB
        ? 0
        : diffA > diffB
        ? -1 * compareFactor
        : 1 * compareFactor;
    })
    .map((f) => f.id);
};

const FixturesTable = ({
  mode,
  fullFixtures,
  onFixturesOrderChange,
}: {
  mode: string;
  fullFixtures: FullTeamFixtures[];
  onFixturesOrderChange: (newOrder: string[] | null) => void;
}) => {
  const sortedFullFixtures = useMemo<SortableFullTeamFixtures[]>(() => {
    return fullFixtures.map((f) => ({ id: f.short_name, ...f }));
  }, [fullFixtures]);

  const handleFixturesOrderChange = (newOrder: SortableFullTeamFixtures[]) =>
    onFixturesOrderChange(newOrder.map((f) => f.id));
  const handleResetSortClick = () => onFixturesOrderChange(null);
  const handleHardFixtureSortClick = (gameweek: number) =>
    onFixturesOrderChange(
      makeSortedFixturesOrder(sortedFullFixtures, mode, gameweek, 1)
    );
  const handleEasyFixtureSortClick = (gameweek: number) =>
    onFixturesOrderChange(
      makeSortedFixturesOrder(sortedFullFixtures, mode, gameweek, -1)
    );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          colorScheme="gray"
          display="block"
          overflow="auto"
          height={`${height}px`}
          width={`${width}px`}
          size="sm"
        >
          <Thead position="sticky" top={0} zIndex="sticky">
            <FixturesTableHeaderRow
              onResetSortClick={handleResetSortClick}
              onHardFixtureSortClick={handleHardFixtureSortClick}
              onEasyFixtureSortClick={handleEasyFixtureSortClick}
            />
          </Thead>
          <ReactSortable
            // NOTE: react-sortablejs typescript is not well-defined so just ignore it
            // @ts-ignore
            tag={ForwardableTbody}
            list={sortedFullFixtures}
            setList={handleFixturesOrderChange}
            handle=".handle"
          >
            {sortedFullFixtures.map((team) => (
              <FixturesTableRow key={team.short_name} team={team} mode={mode} />
            ))}
          </ReactSortable>
        </Table>
      )}
    </AutoSizer>
  );
};

export default FixturesTable;
