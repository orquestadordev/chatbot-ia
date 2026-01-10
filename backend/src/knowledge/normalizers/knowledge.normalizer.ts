import { NormalizedKnowledge, RawKnowledgeDocument } from "../knowledge.types";

export interface KnowledgeNormalizer {
  normalize(raw: RawKnowledgeDocument): NormalizedKnowledge;
}

const MULTIPLE_SPACES_REGEX = /\s{2,}/g;
const HEADING_REGEX = /^#{1,6}\s+/;
const LIST_ITEM_REGEX = /^(?<indent>\s*)([-*+]|(\d+\.))\s+(?<content>.+)$/;

export class BasicKnowledgeNormalizer implements KnowledgeNormalizer {
  normalize(raw: RawKnowledgeDocument): NormalizedKnowledge {
    const normalizedLines = this.normalizeLines(raw.content);
    const collapsed = this.collapseEmptyLines(normalizedLines);

    return {
      content: collapsed.join("\n").trim(),
      source: raw.source,
      importedAt: new Date()
    };
  }

  private normalizeLines(content: string): string[] {
    return content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.replace(/\t/g, "  "))
      .map((line) => line.replace(/\s+$/g, ""))
      .map((line) => this.normalizeLine(line));
  }

  private normalizeLine(line: string): string {
    const trimmed = line.trim();

    if (!trimmed) {
      return "";
    }

    if (HEADING_REGEX.test(trimmed)) {
      return trimmed.replace(MULTIPLE_SPACES_REGEX, " ");
    }

    const listMatch = trimmed.match(LIST_ITEM_REGEX);
    if (listMatch?.groups) {
      const indent = listMatch.groups["indent"] ?? "";
      const marker = listMatch[2];
      const content = (listMatch.groups["content"] ?? "").replace(MULTIPLE_SPACES_REGEX, " ");
      return `${indent}${marker} ${content}`.trimEnd();
    }

    return trimmed.replace(MULTIPLE_SPACES_REGEX, " ");
  }

  private collapseEmptyLines(lines: string[]): string[] {
    const result: string[] = [];
    for (const line of lines) {
      if (!line) {
        if (result.at(-1) === "") {
          continue;
        }
        result.push("");
        continue;
      }
      result.push(line);
    }
    return result;
  }
}

export const basicKnowledgeNormalizer = new BasicKnowledgeNormalizer();
