export enum HomeTableColumnAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface HomePageTableColumn {
  header: string;
  align?: HomeTableColumnAlign;
}

export interface HomePageTableRow {
  cells: (string | React.ReactNode)[];
}

export interface HomePageTableProps {
  headerColumns: HomePageTableColumn[];
  rows: HomePageTableRow[];
  className?: string;
}

export const PACKAGE_ROWS: HomePageTableRow[] = [
  {
    cells: [
      <a
        key="pkg1"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell
      </a>,
      'cspell command-line application',
    ],
  },
  {
    cells: [
      <a
        key="pkg2"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin"
        target="_blank"
        rel="noopener noreferrer"
      >
        @cspell/eslint-plugin
      </a>,
      'CSpell ESLint Plugin',
    ],
  },
  {
    cells: [
      <a
        key="pkg3"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-bundled-dicts"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-bundled-dicts
      </a>,
      'collection of dictionaries bundled with cspell.',
    ],
  },
  {
    cells: [
      <a
        key="pkg4"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-glob"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-glob
      </a>,
      'glob library.',
    ],
  },
  {
    cells: [
      <a
        key="pkg5"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-io"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-io
      </a>,
      'i/o library.',
    ],
  },
  {
    cells: [
      <a
        key="pkg6"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-lib"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-lib
      </a>,
      'cspell library used for code driven spelling checking (used by the application).',
    ],
  },
  {
    cells: [
      <a
        key="pkg7"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-types"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-types
      </a>,
      'cspell types and JSON schema for cspell configuration files.',
    ],
  },
  {
    cells: [
      <a
        key="pkg8"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-tools"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-tools
      </a>,
      'tool used to compile dictionaries.',
    ],
  },
  {
    cells: [
      <a
        key="pkg9"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie-lib"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-trie-lib
      </a>,
      'trie data structure used to store words.',
    ],
  },
  {
    cells: [
      <a
        key="pkg10"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie"
        target="_blank"
        rel="noopener noreferrer"
      >
        cspell-trie
      </a>,
      'trie data tool used to store words.',
    ],
  },
  {
    cells: [
      <a
        key="pkg11"
        href="https://github.com/streetsidesoftware/cspell/tree/main/packages/hunspell-reader"
        target="_blank"
        rel="noopener noreferrer"
      >
        hunspell-reader
      </a>,
      'reads Hunspell files and outputs words.',
    ],
  },
];

export const RFC_ROWS: HomePageTableRow[] = [
  {
    cells: [
      <a key="rfc1" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0001%20suggestions/">
        rfc-0001
      </a>,
      'Fixing common misspellings',
      'Done',
    ],
  },
  {
    cells: [
      <a
        key="rfc2"
        href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0002%20improve%20dictionary%20suggestions/"
      >
        rfc-0002
      </a>,
      'Improving Generated Suggestions',
      'Done',
    ],
  },
  {
    cells: [
      <a key="rfc3" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0003%20parsing%20files/">
        rfc-0003
      </a>,
      'Plug-ins: Adding file parsers',
      'In Progress',
    ],
  },
  {
    cells: [
      <a key="rfc4" href="https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0004%20known%20issues/">
        rfc-0004
      </a>,
      'Support Marking Issues as Known',
      'Not started',
    ],
  },
];

export const VERSION_ROWS: HomePageTableRow[] = [
  {
    cells: ['cspell', '9.x', '20.x', 'In Active Development', 'TBD', 'TBD'],
  },
  {
    cells: ['cspell', '8.x', '18.x', 'Maintenance', '2025-05-01', '2025-06-01'],
  },
  {
    cells: ['cspell', '7.x', '16.x', 'Paid support only[^1]', '2023-10-01', '2023-11-07'],
  },
  {
    cells: ['cspell', '6.x', '14.14.x', 'Paid support only[^1]', '2023-04-01', '2023-05-01'],
  },
  {
    cells: ['cspell', '5.x', '12.x', 'Paid support only[^1]', '-', '2022-10-01'],
  },
  {
    cells: ['cspell', '4.x', '10.x', 'Paid support only[^1]', '-', '2022-05-01'],
  },
];
