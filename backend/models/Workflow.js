import mongoose from 'mongoose'

const stepSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  actionType: {
    type: String,
    enum: ['function', 'formCreate', 'formUpdate', 'formDelete', 'operation'],
    required: true
  },
  functionName: { type: String },
  schema: { type: String },
  inputMapping: { type: mongoose.Schema.Types.Mixed, default: {} },
  condition: {
    field: { type: String },
    operator: { type: String },
    value: { type: mongoose.Schema.Types.Mixed }
  },
  onSuccess: { type: String },
  onFailure: {
    action: { type: String, enum: ['abort', 'skip', 'redirect'], default: 'abort' },
    targetStepId: { type: String }
  }
}, { _id: false })

const workflowSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  workflowName: { type: String, required: true },
  description: { type: String },
  triggerEvent: {
    type: { type: String },
    schema: { type: String }
  },
  steps: { type: [stepSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  publishedAt: { type: Date }
}, { timestamps: true })

workflowSchema.index({ projectName: 1, workflowName: 1, version: 1 }, { unique: true })

export default mongoose.model('Workflow', workflowSchema)