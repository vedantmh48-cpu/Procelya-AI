// Seed script - prepopulates MongoDB with PS11 test data.
// Run with: npm run seed

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import ProjectContext from './models/ProjectContext.js'
import Workflow from './models/Workflow.js'
import WorkflowRun from './models/WorkflowRun.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/procelya'

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected')

    // Clear existing data
    await Promise.all([
      ProjectContext.deleteMany({}),
      Workflow.deleteMany({}),
      WorkflowRun.deleteMany({})
    ])
    console.log('🧹 Cleared existing data')

    // 1. Project Context
    const projectContext = await ProjectContext.create({
      projectName: 'sample-flow',
      schemas: ['orders', 'invoices', 'assets'],
      functions: ['NotifyVendorOnOrder', 'SendOrderConfirmation', 'ValidateAssetRequest', 'NotifyApprover', 'NotifyRequester', 'GenerateReceipt'],
      operations: ['UpdateInventory', 'UpdateRequest', 'ReleaseVendorPayment', 'CreateAsset', 'RejectRequest']
    })
    console.log('📦 ProjectContext seeded:', projectContext.projectName)

    // 2. Order Placed Flow
    const orderFlow = await Workflow.create({
      projectName: 'sample-flow',
      workflowName: 'OrderPlacedFlow',
      description: 'When an order is placed, notify the vendor, create an invoice, update inventory if the stock is physical, and send a confirmation to the customer.',
      triggerEvent: { type: 'order.placed', schema: 'orders' },
      steps: [
        {
          stepId: 'step-001',
          name: 'Notify Vendor',
          order: 1,
          actionType: 'function',
          functionName: 'NotifyVendorOnOrder',
          inputMapping: { orderId: '{{trigger.order.id}}', vendorId: '{{trigger.order.vendor_id}}' },
          onSuccess: 'step-002',
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-002',
          name: 'Create Invoice',
          order: 2,
          actionType: 'formCreate',
          schema: 'invoices',
          inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' },
          onSuccess: 'step-003',
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-003',
          name: 'Update Inventory',
          order: 3,
          actionType: 'operation',
          functionName: 'UpdateInventory',
          inputMapping: { orderId: '{{trigger.order.id}}', stockType: '{{trigger.stock_type}}' },
          condition: { field: '{{trigger.stock_type}}', operator: '==', value: 'physical' },
          onSuccess: 'step-004',
          onFailure: { action: 'skip', targetStepId: null }
        },
        {
          stepId: 'step-004',
          name: 'Send Confirmation',
          order: 4,
          actionType: 'function',
          functionName: 'SendOrderConfirmation',
          inputMapping: { orderId: '{{trigger.order.id}}', customerId: '{{trigger.order.customer_id}}' },
          onSuccess: null,
          onFailure: { action: 'abort', targetStepId: null }
        }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date()
    })
    console.log('📋 OrderPlacedFlow seeded (published, active)')

    // 3. Asset Request Approval Flow
    const assetFlow = await Workflow.create({
      projectName: 'sample-flow',
      workflowName: 'AssetRequestApprovalFlow',
      description: 'Handle asset request approval. If approved, update the request and create the asset. If rejected, reject and notify the requester.',
      triggerEvent: { type: 'asset.request', schema: 'assets' },
      steps: [
        {
          stepId: 'step-001',
          name: 'Validate Asset Request',
          order: 1,
          actionType: 'function',
          functionName: 'ValidateAssetRequest',
          inputMapping: { assetId: '{{trigger.asset_id}}', requesterId: '{{trigger.requester_id}}' },
          onSuccess: 'step-002',
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-002',
          name: 'Notify Approver',
          order: 2,
          actionType: 'function',
          functionName: 'NotifyApprover',
          inputMapping: { requestId: '{{trigger.request_id}}', approverId: '{{trigger.approver_id}}' },
          onSuccess: 'step-003',
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-003',
          name: 'Update Request',
          order: 3,
          actionType: 'operation',
          functionName: 'UpdateRequest',
          inputMapping: { requestId: '{{trigger.request_id}}', status: '{{trigger.approval}}' },
          condition: { field: '{{trigger.approval}}', operator: '==', value: 'YES' },
          onSuccess: 'step-004',
          onFailure: { action: 'redirect', targetStepId: 'step-005' }
        },
        {
          stepId: 'step-004',
          name: 'Create Asset',
          order: 4,
          actionType: 'operation',
          functionName: 'CreateAsset',
          inputMapping: { assetName: '{{trigger.asset_name}}', requesterId: '{{trigger.requester_id}}' },
          onSuccess: null,
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-005',
          name: 'Reject Request',
          order: 5,
          actionType: 'operation',
          functionName: 'RejectRequest',
          inputMapping: { requestId: '{{trigger.request_id}}', reason: '{{trigger.reason}}' },
          condition: { field: '{{trigger.approval}}', operator: '==', value: 'NO' },
          onSuccess: 'step-006',
          onFailure: { action: 'abort', targetStepId: null }
        },
        {
          stepId: 'step-006',
          name: 'Notify Requester',
          order: 6,
          actionType: 'function',
          functionName: 'NotifyRequester',
          inputMapping: { requestId: '{{trigger.request_id}}', requesterId: '{{trigger.requester_id}}', decision: '{{trigger.approval}}' },
          onSuccess: null,
          onFailure: { action: 'abort', targetStepId: null }
        }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date()
    })
    console.log('📋 AssetRequestApprovalFlow seeded (published, active)')

    // 4. Invoice Settlement Flow
    const invoiceFlow = await Workflow.create({
      projectName: 'sample-flow',
      workflowName: 'InvoiceSettlementFlow',
      description: 'Evaluate payment status. If received, release vendor payment and generate receipts.',
      triggerEvent: { type: 'invoice.payment', schema: 'invoices' },
      steps: [
        {
          stepId: 'step-001',
          name: 'Release Vendor Payment',
          order: 1,
          actionType: 'operation',
          functionName: 'ReleaseVendorPayment',
          inputMapping: { invoiceId: '{{trigger.invoice_id}}', vendorId: '{{trigger.vendor_id}}', amount: '{{trigger.amount}}' },
          condition: { field: '{{trigger.payment_status}}', operator: '==', value: 'received' },
          onSuccess: 'step-002',
          onFailure: { action: 'skip', targetStepId: null }
        },
        {
          stepId: 'step-002',
          name: 'Generate Receipt',
          order: 2,
          actionType: 'function',
          functionName: 'GenerateReceipt',
          inputMapping: { invoiceId: '{{trigger.invoice_id}}', amount: '{{trigger.amount}}' },
          onSuccess: null,
          onFailure: { action: 'abort', targetStepId: null }
        }
      ],
      status: 'published',
      version: 1,
      isActive: true,
      publishedAt: new Date()
    })
    console.log('📋 InvoiceSettlementFlow seeded (published, active)')

    console.log('\n✅ Seed complete!')
    console.log('   ProjectContext: sample-flow')
    console.log('   Workflows: OrderPlacedFlow, AssetRequestApprovalFlow, InvoiceSettlementFlow')
    console.log('   All workflows are published and active.')

    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  }
}

seed()