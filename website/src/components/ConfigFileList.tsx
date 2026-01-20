import React from 'react';

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import defaultConfigFilenamesAll from './config-filenames.json';

interface ConfigFileListProps {
  className?: string;
}

const regExpJS = /\.([cm]?js)$/i;
const regExpTS = /\.([cm]?ts)$/i;

const defaultConfigFilenames = defaultConfigFilenamesAll.filter((f) => !f.startsWith('.config/'));
const listVSCode = defaultConfigFilenames.filter((f) => f.startsWith('.vscode'));
const listJson = defaultConfigFilenames.filter((f) => f.includes('.json') && !f.startsWith('.vscode'));
const listYaml = defaultConfigFilenames.filter((f) => f.includes('.yml') || f.includes('.yaml'));
const listJS = defaultConfigFilenames.filter((f) => regExpJS.test(f));
const listTS = defaultConfigFilenames.filter((f) => regExpTS.test(f));
const listToml = defaultConfigFilenames.filter((f) => f.includes('.toml'));
const common = new Set<string>([...listJson, ...listYaml, ...listJS, ...listTS, ...listVSCode, ...listToml]);
const others = defaultConfigFilenames.filter((f) => !common.has(f));

const tabs = [
  { label: 'Yaml', list: listYaml },
  { label: 'Json', list: listJson },
  { label: 'JavaScript', list: listJS },
  { label: 'TypeScript', list: listTS },
  { label: 'Toml', list: listToml },
  { label: '.vscode', list: listVSCode },
];

if (others.length) {
  tabs.push({ label: 'Others', list: others });
}

function toListItem(filename: string, index: number): React.ReactElement {
  return (
    <li key={index}>
      <code>{filename}</code>
    </li>
  );
}

function toList(list: string[]): React.ReactElement {
  return <ul style={{ columnCount: list.length > 6 ? 2 : 1 }}>{list.map(toListItem)}</ul>;
}

export function ConfigFileList(props: ConfigFileListProps): React.ReactElement {
  return (
    <div className={props.className}>
      <Tabs>
        {tabs.map(({ label, list }, index) => (
          <TabItem value={label.toLowerCase()} label={label} key={index}>
            {toList(list)}
          </TabItem>
        ))}
      </Tabs>

      <Admonition type="info" >
      <code>cspell</code> configuration files can be prefixed with <code>.</code> and or <code>.config</code>,
      i.e. <code>.cspell.config.yaml</code>, <code>.config/cspell.config.yaml</code> and <code>.config/.cspell.config.yaml</code>.
      </Admonition>

      <Admonition type="info" >
      <b><code>package.json</code></b>: Only the <code>cspell</code> fields in <code>package.json</code> is considered.
      </Admonition>
    </div>
  );
}
