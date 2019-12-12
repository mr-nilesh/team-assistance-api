import { Router } from 'express';
import Handlers from '@handlers';
import fs from 'fs';
import Models from '@models';
import async = require("async");
import { reject, resolve } from 'bluebird';
const { exec } = require('child_process');
const _ = require('lodash');
let userData: any = {};

// Init shared
const router = Router();

router.post('/', async (req, res) => {
  const meetingObj = {
    meetingName: req.body.meetingName,
    startedBy: req.body.startedBy,
    createdAt: new Date()
  };
  Handlers.MeetingHandlers.CreateMeeting(meetingObj)
    .then((meeting) => {
      return res.status(200).send(meeting);
    }, (err) => {
      return res.status(500).send(err);
    });
});

router.put('/:meetingId', async (req, res) => {
  // const speechToTextObj = {
  //   encoding: 'FLAC',
  //   languageCode: 'en-US',
  //   content: req.body.meetingAudio,
  //   sampleRate: 8000,
  //   enableSpeakerDiarization: true,
  //   enablePunctuation: true,
  //   audioType: "callcenter"
  // };
  Models.User.find({})
  .then((users) => {
    if(users && users.length > 0) {
      let userIDs: any = [];
      users.forEach(user => {
        userIDs.push(user.id);
        userData[user.id] = user.fullName;
      });
      const speechToTextObj = {
        sampleRate: 8000,
        encoding: "FLAC",
        languageCode: "en-US",
        speakerIds: userIDs,
        content: req.body.meetingAudio
        // enablePunctuation: true,
        // enableSpeakerDiarization: true
        // doVad: true
        // speakerCount: 3
      }
      Handlers.MeetingHandlers.DiarizeAudio(speechToTextObj)
      .then((data: any) => {
        if(data.segments) {
          ProcessAudioFile(req.body.meetingAudio, data.segments);
          return res.status(200).send({data: 'Processing audio file.'});
        } else {
          return res.status(400).send(data.error);
        }
      }, (err: any) => {
        return res.status(500).send(err);
      });
    } else {
      res.status(204).send('No users found.');
    }
  });
});

function ProcessAudioFile(base64Audio: any, segments: any[]) {
  console.log('Processing audio file. Removing previous audio files.');
  exec(`rm -rf sample-audio-*.mp3 speech-output.txt`, (err: any) => {
    fs.writeFile(
      'sample-audio.mp3',
      base64Audio,
      {
        encoding: 'base64'
      },
      async (err) => {
        fs.appendFile('speech-output.txt', '', (err: any) => {});
        generateAudioChunks(segments, async (segment: any, index: number) => {
          return new Promise((resolve: any, reject: any) => {
            exec(`ffmpeg -i sample-audio.mp3 -ss ${segment.start} -to ${segment.end} -c copy sample-audio-${index}.mp3`, (err: any, stdout: any, stderr: any) => {
              console.log(`Generated sample-audio-${index}.mp3 file.`);
              setTimeout(() => {
                Handlers.SpeechRecognizationHandlers.ConvertAudioToTextSync(`sample-audio-${index}.mp3`)
                  .then((data: any) => {
                    if(data && data.length > 0) {
                      const speackerName = userData[segment.speaker_id] || 'Someone';
                      fs.appendFile('speech-output.txt',`${speackerName} said: ${data}\n`, (err: any) => {});
                      resolve(data);
                    }
                  }, (err: any) => {
                    console.log('ERROR', err);
                    reject(err);
                  });
              }, 1000);
            });
          });
        });
      }
    );
  });
}

async function generateAudioChunks(segments: any, callback: any) {
  console.log('Before for loop.');
  for(let index=0; index < segments.length; index++) {
    console.log('await index:', index);
    await callback(segments[index], index, segments);
    console.log('finished index:', index);
  }
  console.log('After for loop.');

}


async function Test () {
  const fs = require('fs');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech').v1p1beta1;

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const fileName = 'Local path to audio file, e.g. /path/to/audio.raw';

  const config = {
    encoding: `MP3`,
    sampleRateHertz: 8000,
    languageCode: `en-US`,
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 3,
    model: `phone_call`,
  };

  const audio = {
    content: fs.readFileSync('../../3_person_conversation.mp3').toString('base64'),
  };

  const request = {
    config: config,
    audio: audio,
  };
  console.log('Recognizing...');
  const [response] = await client.recognize(request);
  console.log(response, 'response---');
  const transcription = response.results
    .map((result: any) => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  console.log(`Speaker Diarization:`);
  const result = response.results[response.results.length - 1];
  const wordsInfo = result.alternatives[0].words;
  // Note: The transcript within each result is separate and sequential per result.
  // However, the words list within an alternative includes all the words
  // from all the results thus far. Thus, to get all the words with speaker
  // tags, you only have to take the words list from the last result:
  wordsInfo.forEach((a: any) =>
    console.log(` word: ${a.word}, speakerTag: ${a.speakerTag}`)
  );
}

export default router;