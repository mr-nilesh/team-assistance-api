import User, { IUser } from '@models';
import Handlers from '@handlers';

interface ICreateUserInput {
  fullName: IUser['fullName'];
  mobile: IUser['mobile'];
  speechRecognizationID: IUser['speechRecognizationID'];
  enrollmentStatus: IUser['enrollmentStatus'];
  enrollmentAudio: IUser['enrollmentAudio'];
}

interface IGetUserInput {
  mobile: IUser['mobile'];
  id: IUser['id'];
  updateObj: any
}

async function CreateUser({
  fullName,
  mobile,
  speechRecognizationID,
  enrollmentStatus,
  enrollmentAudio
}: ICreateUserInput): Promise<any> {
  return User.findOne({mobile: mobile})
    .then((data: any) => {
      if(!data) {
        return User.create({
          fullName,
          mobile,
          speechRecognizationID,
          enrollmentStatus,
          enrollmentAudio
        })
          .then((data: IUser) => {
            console.log('User added successfully.');
            const enrollObj = {
              content: enrollmentAudio,
              sampleRate: 8000,
              encoding: 'FLAC',
              languageCode: 'en-US',
              speakerId: data.id
            };
            console.log('Enrolling user...');
            return Handlers.SpeechRecognizationHandlers.EnrollUser(enrollObj)
            .then((daResponse: any) => {
              if (daResponse.message === 'Success') {
                console.log(`User ${fullName} enrolled successfully.`);
              }
              const copyOfUser = JSON.parse(JSON.stringify(data));
              copyOfUser.enrollmentStatus = daResponse.message
              return copyOfUser;
            });
          })
          .catch((error: Error) => {
            throw error;
          });
      } else {
        return data;
      }
    });
}

async function GetUsers(): Promise<IUser[]> {
  return User.find({})
    .then((data) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function GetUser({
  mobile
}: IGetUserInput): Promise<IUser> {
  return User.findOne({
    mobile
  })
    .then((data: any) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function UpdateUser(id: string, updateObj: any): Promise<IUser> {
  return User.findOneAndUpdate({id: id}, updateObj)
    .then((data: any) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

export default {
  CreateUser,
  GetUsers,
  GetUser,
  UpdateUser
};