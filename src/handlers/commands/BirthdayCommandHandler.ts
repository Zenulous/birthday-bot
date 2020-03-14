import Discord = require("discord.js");
import moment from "moment";
import { db, client } from "../../app";
import { getRandomBotResponse } from "../../utils/getRandomBotResponse";
import birthdayChannelResponses from "../../responses/birthdayChannel.json";
import { getMessageContentWithoutCommand } from "../../utils/getMessageContentWithoutCommand";

export class BirthdayCommandHandler {
  static async handleMessage(message: Discord.Message) {
    message.content = getMessageContentWithoutCommand(message);
    const currentUserId = message.author.id;
    if (message.content === "") {
      await db
        .get("birthdays")
        .remove({ userId: currentUserId })
        .write();
      await message.channel.send(`I deleted your birthday. 🙂`);
      return;
    }
    const currentUserBirthday = moment.utc(message.content, "DD-MM-YYYY");

    if (!currentUserBirthday.isValid()) {
      await message.channel.send(
        "I don't really understand that.. Please submit your birthday in the following format: DD-MM-YYYY."
      );
      return;
    }

    const userAge = this.getYearsPassedSinceDate(currentUserBirthday);
    if (userAge < 13) {
      await message.channel.send(
        "Your birthyear does not seem to be quite right... Please submit your birthday in the following format: DD-MM-YYYY."
      );
      return;
    }

    await db
      .get("birthdays")
      .remove({ userId: currentUserId })
      .write();

    await db
      .get("birthdays")
      .push({ userId: currentUserId, date: currentUserBirthday.toISOString() })
      .write();

    await message.channel.send(
      `Your birthdate is set to ${currentUserBirthday.format("LL")}.`
    );

    if (this.isDateABirthdayToday(currentUserBirthday)) {
      await this.celebrateUserBirthday(message.author, currentUserBirthday);
    }
  }

  static async handleBirthdays() {
    const birthdays = db
      .get("birthdays")
      .filter(value => {
        const valueDate = moment.utc(value.date, "YYYY-MM-DD");
        return this.isDateABirthdayToday(valueDate);
      })
      .value();

    birthdays.forEach(async birthday => {
      const birthdayDate = moment.utc(birthday.date, "YYYY-MM-DD");
      const birthdayUser = client.users.get(birthday.userId);

      if (birthdayUser == null) {
        db.get("birthdays")
          .remove({ userId: birthday.userId })
          .write();
      } else {
        await this.celebrateUserBirthday(birthdayUser, birthdayDate);
      }
    });
  }

  private static isDateABirthdayToday(date: moment.Moment) {
    const currentDate = moment.utc().startOf("day");
    return (
      date.date() === currentDate.date() && date.month() === currentDate.month()
    );
  }

  private static getYearsPassedSinceDate(date: moment.Moment) {
    return moment().diff(date, "years");
  }

  private static async celebrateUserBirthday(
    user: Discord.User,
    date: moment.Moment
  ) {
    const userAge = this.getYearsPassedSinceDate(date);
    try {
      await user.send(`Congratulations on your ${userAge}th birthday!`);
    } catch {}
    const channelToMessage = client.channels.get(
      process.env.BIRTHDAY_CHANNEL_ID!
    ) as Discord.TextChannel;
    await channelToMessage.send(
      getRandomBotResponse(birthdayChannelResponses).replace(
        new RegExp("{userId}", "g"),
        user.id
      )
    );
  }
}
