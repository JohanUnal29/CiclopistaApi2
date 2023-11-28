import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const lastSessionCollection = "lastSession";

const lastSessionSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  datetime: {
    type: String,
    required: true,
  },
});

lastSessionSchema.plugin(mongoosePaginate);

const lastSessionModel = mongoose.model(lastSessionCollection, lastSessionSchema);

export default lastSessionModel;