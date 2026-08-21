import RequirementPanel from '../components/RequirementPanel'
import DetectedWorkflowPanel from '../components/DetectedWorkflowPanel'
import WorkflowDiagram from '../components/WorkflowDiagram'
import TriggerPanel from '../components/TriggerPanel'
import ExecutionLog from '../components/ExecutionLog'
import StatusPanel from '../components/StatusPanel'
import AIEditPanel from '../components/AIEditPanel'

export default function BuilderView({
  text, setText, detecting, onDetect,
  detected, workflow, accepted, accepting, onDiscard, onAccept,
  onCopyJson, onDownloadJson, onDownloadPdf,
  running, onRun, payload, setPayload,
  logs, onClearLogs,
  run, onViewLogs, onRunAgain, onStop, onPause, onResume, onRetry,
  workflowId, warnings, onSaveDraft
}) {
  return <div className="grid">
    <RequirementPanel value={text} onChange={setText} detecting={detecting} onDetect={onDetect} />
    <DetectedWorkflowPanel detected={detected} workflow={workflow} accepted={accepted} accepting={accepting} onDiscard={onDiscard} onAccept={onAccept} warnings={warnings} />
    {accepted && <>
      <WorkflowDiagram workflow={workflow} onCopyJson={onCopyJson} onDownloadJson={onDownloadJson} onDownloadPdf={onDownloadPdf} workflowId={workflowId} onSaveDraft={onSaveDraft} />
      <AIEditPanel workflowId={workflowId} workflow={workflow} onApply={onSaveDraft} />
      <TriggerPanel running={running} onRun={onRun} payload={payload} setPayload={setPayload} />
      <ExecutionLog logs={logs} running={running} onClear={onClearLogs} />
      <StatusPanel run={run} logs={logs} onViewLogs={onViewLogs} onRunAgain={onRunAgain} onStop={onStop} onPause={onPause} onResume={onResume} onRetry={onRetry} onClear={onClearLogs} />
    </>}
  </div>
}