export function getRandomBotResponse(responses: BotResponse[]): string {
  const responseMessages = Object.values(responses);
  const randomMessage =
    responseMessages[Math.floor(Math.random() * responseMessages.length)].text;
  return randomMessage;
}
