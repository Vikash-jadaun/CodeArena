import { AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const getFailureTitle = (failure) => {
  const description = (failure?.status || '').toLowerCase();
  const statusId = Number(failure?.statusId);
  if (statusId === 6 || description.includes('compilation')) return 'Compilation Error';
  if (statusId === 5 || description.includes('time limit')) return 'Time Limit Exceeded';
  if (description.includes('memory limit')) return 'Memory Limit Exceeded';
  if (statusId === 13 || description.includes('internal')) return 'Internal Judge Error';
  if ((statusId >= 7 && statusId <= 12) || description.includes('runtime')) return 'Runtime Error';
  if (statusId === 4 || description.includes('wrong answer')) return 'Wrong Answer';
  return failure?.status || 'Execution Failed';
};

const getCaseStatus = (testCase) => {
  if (Number(testCase.status_id) === 3) return { passed: true, label: 'Passed' };
  return { passed: false, label: getFailureTitle({ statusId: testCase.status_id, status: testCase.status?.description }) };
};

function TestCaseResult({ testCase, index }) {
  const { passed, label } = getCaseStatus(testCase);
  const message = testCase.compile_output || testCase.stderr;
  return (
    <details className={`execution-case ${passed ? 'case-passed' : 'case-failed'}`} open={!passed || index === 0}>
      <summary className="execution-case-summary">
        <span className="case-heading">{passed ? <CheckCircle2 size={15} /> : <XCircle size={15} />} Test case {index + 1}</span>
        <span className={`case-status ${passed ? 'success-text' : 'failure-text'}`}>{label}</span>
      </summary>
      <div className="execution-case-body">
        <OutputField label="Input" value={testCase.stdin} />
        <OutputField label="Expected output" value={testCase.expected_output} />
        <OutputField label="Actual output" value={testCase.stdout} />
        {message && <OutputField label={testCase.compile_output ? 'Compiler output' : 'Runtime output'} value={message} tone="error" />}
      </div>
    </details>
  );
}

function OutputField({ label, value, tone }) {
  if (value === undefined || value === null || value === '') return null;
  return <div className="execution-output-field"><span className="output-label">{label}</span><pre className={`console-output ${tone === 'error' ? 'output-error' : ''}`}>{value}</pre></div>;
}

function Metric({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return <div className="execution-metric"><span>{label}</span><strong>{value}</strong></div>;
}

export function RunResult({ result }) {
  const cases = result.testCases || [];
  const passedCount = cases.filter((testCase) => Number(testCase.status_id) === 3).length;
  const allPassed = Boolean(result.success);
  const failureCase = cases.find((testCase) => Number(testCase.status_id) !== 3);
  const failure = failureCase
    ? { statusId: failureCase.status_id, status: failureCase.status?.description }
    : { status: result.error };
  const title = allPassed ? 'All test cases passed' : getFailureTitle(failure);

  return (
    <section className="execution-result" aria-live="polite">
      <div className={`execution-summary ${allPassed ? 'summary-success' : 'summary-failure'}`}>
        {allPassed ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
        <div className="summary-copy"><strong>{title}</strong><span>{passedCount} of {cases.length} visible test cases passed</span></div>
      </div>
      <div className="execution-metrics">
        <Metric label="Passed" value={`${passedCount}/${cases.length}`} />
        <Metric label="Runtime" value={result.runtime !== undefined ? `${result.runtime} sec` : null} />
        <Metric label="Memory" value={result.memory !== undefined ? `${result.memory} KB` : null} />
      </div>
      {result.error && <p className="execution-message failure-text">{result.error}</p>}
      <div className="execution-case-list">
        {cases.map((testCase, index) => <TestCaseResult key={`${index}-${testCase.token || 'case'}`} testCase={testCase} index={index} />)}
      </div>
    </section>
  );
}

export function SubmissionResult({ result, celebrationId }) {
  const accepted = Boolean(result.accepted);
  const passed = result.passedTestCases ?? 0;
  const total = result.totalTestCases ?? 0;
  const failure = result.failure || {};
  const title = accepted ? 'Accepted' : getFailureTitle(failure);
  const FailureIcon = Number(failure.statusId) === 5 ? Clock3 : XCircle;

  return (
    <section className="execution-result" aria-live="polite">
      <div key={celebrationId || 'accepted-result'} className={`submission-summary ${accepted ? 'submission-accepted' : 'submission-failed'} ${accepted && celebrationId ? 'accepted-enter' : ''}`}>
        {accepted ? <CheckCircle2 className="accepted-icon" size={25} /> : <FailureIcon size={21} />}
        <div className="summary-copy"><strong>{title}</strong><span>{accepted ? 'Congratulations! Problem solved.' : 'This submission did not pass the full judge suite.'}</span></div>
      </div>
      <div className="execution-metrics">
        <Metric label="Test cases passed" value={`${passed}/${total}`} />
        <Metric label="Runtime" value={result.runtime !== undefined ? `${result.runtime} sec` : null} />
        <Metric label="Memory" value={result.memory !== undefined ? `${result.memory} KB` : null} />
      </div>
      {!accepted && (failure.message || result.error) && <OutputField label={failure.status || 'Error details'} value={failure.message || result.error} tone="error" />}
      {accepted && celebrationId && <SuccessCelebration key={celebrationId} />}
    </section>
  );
}

function SuccessCelebration() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return <div className="success-celebration" role="status" aria-live="polite"><Confetti /><span className="celebration-icon"><CheckCircle2 size={17} /></span><strong>Congratulations! Problem Solved!</strong><span>Your accepted solution is recorded.</span></div>;
}

function Confetti() {
  return <div className="confetti-layer" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--confetti-left': `${(index * 37 + 7) % 100}%`, '--confetti-delay': `${(index % 6) * 90}ms`, '--confetti-duration': `${1800 + (index % 5) * 130}ms`, '--confetti-rotate': `${(index * 53) % 360}deg` }} />)}</div>;
}

