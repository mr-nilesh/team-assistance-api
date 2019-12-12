import request = require('request-promise');
import config from '../config/development';
import fs from 'fs';

async function EnrollUser(enrollObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/diarization/enroll?apikey=${config.deepAffectsAPIKey}`,
    body: enrollObj,
    json: true,
    headers: {
      'apikey': config.deepAffectsAPIKey
    }
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function SpeechToText(postObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/diarization/identify?apikey=${config.deepAffectsAPIKey}`,
    // uri: `https://proxy.api.deepaffects.com/audio/generic/api/v1/async/asr?apikey=${config.deepAffectsAPIKey}&webhook=https://webhook.site/ef5fa8db-b831-4017-b123-08f11a9e60d0`,
    body: postObj,
    json: true,
    headers: {
      'apikey': config.deepAffectsAPIKey
    }
  };

  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

async function ConvertAudioToText(filePath: any) {
  console.log(`Converting ${filePath} audio to text file.`);
  const speech = require('@google-cloud/speech');
  const CloudStorage = require('@google-cloud/storage');
  const path = require('path');
  const _ = require('lodash');
  const bucketName = 'team-assistance';
  const speechClient = new speech.SpeechClient();
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const uploadToGcs = async () => {
    const storage = new CloudStorage.Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  
    const bucket = storage.bucket(bucketName);
    const fileName = path.basename(filePath);
  
    await bucket.upload(filePath);
 
    return `gs://${bucketName}/${fileName}`;
  };
  
  // Upload to Cloud Storage first, then detects speech in the audio file
  return uploadToGcs()
    .then(async (gcsUri) => {
      const audio = {
        uri: gcsUri,
      };
  
      const config = {
        encoding: 'FLAC',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
      };
  
      const request = {
        audio,
        config,
      };
  
      return speechClient.longRunningRecognize(request)
        .then((data: any) => {
          const operation = data[0];
  
          // The following Promise represents the final result of the job
          return operation.promise();
        })
        .then((data: any) => {
          const results = _.get(data[0], 'results', []);
          const transcription = results
            .map((result: any) => result.alternatives[0].transcript)
            .join('\n');
          console.log(`Transcription: ${transcription}`);
          return transcription;
        })
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

async function ConvertAudioToTextSync(filePath: any) {
  console.log(`Converting audio to text for ${filePath}`);
  const _ = require('lodash');
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  
  // Creates a client
  const speechClient = new speech.SpeechClient();
  
  
  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString('base64');
  const audio = {
    content: audioBytes,
  };
  
  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    encoding: 'MP3',
    sampleRateHertz: 44100,
    languageCode: 'en-US',
  };
  
  const request = {
    audio,
    config,
  };
 
  // Detects speech in the audio file
  return speechClient
    .recognize(request)
    .then((data: any) => {
      const results = _.get(data[0], 'results', []);
      const transcription = results
        .map((result: any) => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Got text for ${filePath}, text is: ${transcription}`);
      return transcription;
    })
    .catch((err: any) => {
      console.error('ERROR:', err);
      return err;
    });
}

export default {
  EnrollUser,
  SpeechToText,
  ConvertAudioToText,
  ConvertAudioToTextSync
};