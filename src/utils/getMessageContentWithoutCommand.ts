import { Message } from "discord.js";

export function getMessageContentWithoutCommand(message: Message) {
  const firstSpaceInMessageContentIndex = message.content.indexOf(" ");
  if (firstSpaceInMessageContentIndex === -1) {
    return "";
  }
  const messageContentWithoutCommand = message.content.substr(
    firstSpaceInMessageContentIndex + 1
  );
  return messageContentWithoutCommand;
}
