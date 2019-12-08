import request = require('request-promise');
import config from '../config/development';
async function EnrollUser(enrollObj: any) {
  const requestOptions = {
    method: 'POST',
    uri: `https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/diarization/enroll?apikey=${config.deepAffectsAPIKey}`,
    body: enrollObj,
    json: true,
    headers: {
      'apikey': config.deepAffectsAPIKey,
    },
  };
  return request.post(requestOptions)
    .then((data: any) => {
      return data;
    }, (err: any) => {
      return err;
    });
}

export default {
  EnrollUser,
};
