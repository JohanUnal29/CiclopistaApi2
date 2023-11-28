//@ts-check
import { Schema, model } from 'mongoose';
import monsoosePaginate from 'mongoose-paginate-v2';

const schema = new Schema({
  firstName: { type: String, max: 100 },
  lastName: { type: String, max: 100 },
  email: { type: String, required: true, max: 100, unique: true },
  rol: { type: String, default: 'user', required: true },
  tickets: {
    type: [
      {
        ticket: {
          type: Schema.Types.ObjectId,
          ref: 'tickets',
        },
      },
    ],
    default: [],
  },
});
schema.plugin(monsoosePaginate);
export const UserModel = model('ciclopistausers', schema);
