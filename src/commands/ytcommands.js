// File: src/commands/ytcommands.js
import playdl from "play-dl";
import fs from "fs";
import yts from "yt-search";
import fetch from "node-fetch";

// Helper to send audio/video
const sendFile = async (sock, jid, url, type, title) => {
  const stream = await playdl.stream(url);
  const path = `./temp_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
  const writer = fs.createWriteStream(path);
  stream.stream.pipe(writer);

  await new Promise((resolve) => writer.on("finish", resolve));
  await sock.sendMessage(jid, { [type]: { url: path }, mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4', ptt: false, caption: title });
  fs.unlinkSync(path);
};

export default async function ytCommands(sock, m, command, args) {
  const query = args.join(" ");
  if (!query) return m.reply("Please provide a search query or YouTube URL!");

  try {
    if (command === 'play' || command === 'song' || command === 'ytmp3') {
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return m.reply("No results found!");
      await sendFile(sock, m.chat, video.url, "audio", video.title);
    } else if (command === 'ytmp4' || command === 'ytvideo') {
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return m.reply("No results found!");
      await sendFile(sock, m.chat, video.url, "video", video.title);
    }
  } catch (e) {
    console.error(e);
    return m.reply("Failed to download. Try again later.");
  }
}

// Usage in main handler:
// import ytCommands from './src/commands/ytcommands.js';
// case 'play': case 'ytmp3': case 'ytmp4': case 'song':
//   ytCommands(sock, m, command, args);
