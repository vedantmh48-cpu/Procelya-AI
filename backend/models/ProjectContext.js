import mongoose from 'mongoose'

const projectContextSchema = new mongoose.Schema({
  projectName: { type: String, required: true, unique: true },
  schemas: { type: [String], default: [] },
  functions: { type: [String], default: [] },
  operations: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('ProjectContext', projectContextSchema)