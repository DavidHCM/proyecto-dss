import { danger, fail, message } from "danger";

const commits = danger.github.commits;

commits.forEach((commit) => {
  const messageLines = commit.commit.message.split("\n");

  const title = messageLines[0];
  const description = messageLines.slice(1).join("\n").trim();

  if (title.length > 50) {
    fail(
      `Commit title is too long (${title.length} characters). Should be 50 characters or less.`,
    );
  }

  if (messageLines.length > 1 && messageLines[1].trim() !== "") {
    fail(
      "Commit message must have an empty line between title and description.",
    );
  }

  if (description.length > 0 && description.length < 5) {
    fail("Commit description should have at least 5 characters.");
  }

  const descriptionLines = description.split("\n");
  descriptionLines.forEach((line) => {
    if (line.length > 72) {
      fail(
        "Each line in the commit description should be 72 characters or less.",
      );
    }
  });
});

if (!danger.github.commits.some((commit) => commit.errors)) {
  message("LGTM!");
}
