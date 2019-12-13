import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  mobile: string;
  speechRecognizationID: string;
  enrollmentStatus: string;
  enrollmentAudio: string;
}

const UserSchema: Schema = new Schema({
  fullName             : { type: String, required: true, unique: true },
  mobile               : { type: String, required: true },
  speechRecognizationID: { type: String, required: false },
  enrollmentStatus     : { type: String, required: false },
  enrollmentAudio      : { data: Buffer, contentType: String }
});

// Export the model and return your IUser interface
export default mongoose.model<IUser>('User', UserSchema);