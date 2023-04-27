import React, { useEffect, useState } from "react";
import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { getSearch, getRubyVersions } from "./api";

export default function SearchDocs() {
  const [searchText, setSearchText] = useState("");
  const [rubyVersions, setRubyVersions] = useState([]);
  const [selectedRubyVersion, setSelectedRubyVersion] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function fetchRubyVersions() {
      try {
        const result = await getRubyVersions();
        setRubyVersions(result);
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Error fetching Ruby versions",
          message: error.message,
        });
      }
    }
    fetchRubyVersions();
  }, []);

  useEffect(() => {
    if (selectedRubyVersion !== "") {
      showToast({ title: "Ruby version", message: `Ruby version ${selectedRubyVersion} selected!` });
    }
  }, [selectedRubyVersion]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsSearching(true);
        const result = await getSearch(searchText, selectedRubyVersion);
        setIsSearching(false);
        setResults(result);
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Error fetching search results",
          message: error.message,
        });
      }
    }
    fetchData();
  }, [searchText, selectedRubyVersion]);

  const codeSectionMarkdown = (item) => {
    return `### ${item.title}\n\n${item.textAboveBlock}\n\n\`\`\`\n${item.block}\`\`\`\n\n${item.textBelowBlock}`;
  };

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          isLoading={rubyVersions.length === 0}
          tooltip="Select Ruby version"
          storeValue={true}
          onChange={(newValue) => {
            setSelectedRubyVersion(newValue);
          }}
        >
          {rubyVersions.map((item) => {
            return (
              <List.Dropdown.Item
                key={Math.random().toString(36)}
                icon={{ source: "ruby-icon.png" }}
                title={item}
                value={item}
              />
            );
          })}
        </List.Dropdown>
      }
      isLoading={isSearching}
      isShowingDetail
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search for a method or class ..."
      throttle
    >
      <List.Section title="Results" subtitle={results.length + ""}>
        {results.map((item) => (
          <List.Item
            key={item.id}
            title={item.title}
            detail={<List.Item.Detail markdown={codeSectionMarkdown(item)} />}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={item.link} />
                <Action.CopyToClipboard title="Copy Code Block" content={item.block} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
