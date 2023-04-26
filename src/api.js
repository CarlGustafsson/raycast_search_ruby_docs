import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function getRubyVersions() {
  const url = "https://rubyapi.org";
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
    },
  });

  if (!response.ok) {
    return Promise.reject(response.statusText);
  }

  const body = await response.text();
  const parser = cheerio.load(body, null, false);
  const results = [];
  // TODO: Improve speed of this function by finding the div with the versions instead
  parser("a").map((_index, item) => {
    const parsed = parser(item).attr("href");
    if (parsed) {
      const modifiedVersion = parsed.trim().replace(/[\n\r/]+/g, "");
      if (
        modifiedVersion &&
        modifiedVersion.match(/(\d.{1}\d)|(dev)/) &&
        results.indexOf(modifiedVersion) === -1 &&
        modifiedVersion.length === 3
      ) {
        results.push(modifiedVersion);
      }
    }
  });
  return results;
}

export async function getSearch(query, version) {
  const url = `https://rubyapi.org/${version}/o/s?q=` + query;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
    },
  });

  if (!response.ok) {
    return Promise.reject(response.statusText);
  }

  const body = await response.text();
  const parser = cheerio.load(body, null, false);
  const results = [];

  // TODO: Find a way to get the divs we want instead of looping through all of the divs
  parser("div").map((index, item) => {
    const parsedTitle = parser(item)
      .find("h4")
      .text()
      .trim()
      .replace(/[\n\r]+/g, "");
    const parsedTitleLink = parser(item).find("h4 a").attr("href");
    const parsedText = parser(item).find("p").text();
    const parsedBlock = parser(item).find("pre").text();
    // length of 200 because for some reason one of the entries contains all of the methods on the page
    if (parsedTitle !== "" && parsedTitle.length < 200 && parsedText !== "" && parsedBlock !== "") {
      const splittedText = parsedText.replaceAll(".", ".\n").split(":");
      results.push({
        id: Math.random().toString(36),
        title: parsedTitle,
        link: `https://rubyapi.org${parsedTitleLink}`,
        textAboveBlock: splittedText[0],
        textBelowBlock: splittedText.length > 1 ? splittedText[1] : "",
        block: parsedBlock,
      });
    }
  });

  return results;
}
