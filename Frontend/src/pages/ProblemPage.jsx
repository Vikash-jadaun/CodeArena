import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAI from '../components/ChatAI';
import Editorial from '../components/Editorial';
import BrandLogo from '../components/BrandLogo';
import { ArrowLeft, Expand, Sun, Moon, WandSparkles } from 'lucide-react';
import { useTheme } from '../components/themeContext';
import { useNavigate } from 'react-router';
import { RunResult, SubmissionResult } from '../components/ExecutionResult';

const langMap = {
  cpp: 'c++',
  java: 'java',
  javascript: 'javascript'
};

const getInitialCodeForLanguage = (problemData, selectedLanguage) => {
  const languageKey = langMap[selectedLanguage] || selectedLanguage;
  const entry = problemData?.startCode?.find((sc) => sc.language?.toLowerCase() === languageKey?.toLowerCase());
  return entry?.initialCode || '';
};

const getRequestError = (error, fallback) => {
  const responseData = error.response?.data;
  if (typeof responseData === 'string') return responseData;
  return responseData?.message || error.message || fallback;
};


const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeExecution, setActiveExecution] = useState(null);
  const [celebrationId, setCelebrationId] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [leftWidth, setLeftWidth] = useState(42);
  const editorRef = useRef(null);
  const workspaceRef = useRef(null);
  const executionLockRef = useRef(false);
  const submissionCountRef = useRef(0);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  let {problemId}  = useParams();


//     _id: '507f1f77bcf86cd799439011',
//     title: 'Two Sum',
//     description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

// You may assume that each input would have exactly one solution, and you may not use the same element twice.

// You can return the answer in any order.

// Example 1:
// Input: nums = [2,7,11,15], target = 9
// Output: [0,1]
// Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

// Example 2:
// Input: nums = [3,2,4], target = 6
// Output: [1,2]

// Example 3:
// Input: nums = [3,3], target = 6
// Output: [0,1]

// Constraints:
// - 2 <= nums.length <= 10^4
// - -10^9 <= nums[i] <= 10^9
// - -10^9 <= target <= 10^9
// - Only one valid answer exists.`,
//     difficulty: 'easy',
//     tags: 'array',
//     visibleTestCases: [
//       {
//         input: 'nums = [2,7,11,15], target = 9',
//         output: '[0,1]',
//         explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
//       },
//       {
//         input: 'nums = [3,2,4], target = 6',
//         output: '[1,2]',
//         explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
//       }
//     ],
//     startCode: [
//       {
//         language: 'javascript',
//         initialCode: `/**
//  * @param {number[]} nums
//  * @param {number} target
//  * @return {number[]}
//  */
// var twoSum = function(nums, target) {

// };`
//       },
//       {
//         language: 'java',
//         initialCode: `class Solution {
//     public int[] twoSum(int[] nums, int target) {

//     }
// }`
//       },
//       {
//         language: 'cpp',
//         initialCode: `class Solution {
// public:
//     vector<int> twoSum(vector<int>& nums, int target) {

//     }
// };`
//       }
//     ],
//     editorial: {
//       content: `## Approach 1: Brute Force

// The brute force approach is simple. Loop through each element x and find if there is another value that equals to target - x.

// **Algorithm:**
// 1. For each element in the array
// 2. Check if target - current element exists in the rest of the array
// 3. If found, return the indices

// **Complexity Analysis:**
// - Time complexity: O(n²)
// - Space complexity: O(1)

// ## Approach 2: Hash Table

// To improve our runtime complexity, we need a more efficient way to check if the complement exists in the array. If the complement exists, we need to get its index. What is the best way to maintain a mapping of each element in the array to its index? A hash table.

// **Algorithm:**
// 1. Create a hash table to store elements and their indices
// 2. For each element, calculate complement = target - current element
// 3. If complement exists in hash table, return indices
// 4. Otherwise, add current element to hash table

// **Complexity Analysis:**
// - Time complexity: O(n)
// - Space complexity: O(n)`
//     },
//     solutions: [
//       {
//         language: 'javascript',
//         title: 'Hash Table Approach',
//         code: `var twoSum = function(nums, target) {
//     const map = new Map();

//     for (let i = 0; i < nums.length; i++) {
//         const complement = target - nums[i];

//         if (map.has(complement)) {
//             return [map.get(complement), i];
//         }

//         map.set(nums[i], i);
//     }

//     return [];
// };`
//       },
//       {
//         language: 'java',
//         title: 'Hash Table Approach',
//         code: `class Solution {
//     public int[] twoSum(int[] nums, int target) {
//         Map<Integer, Integer> map = new HashMap<>();

//         for (int i = 0; i < nums.length; i++) {
//             int complement = target - nums[i];

//             if (map.containsKey(complement)) {
//                 return new int[] { map.get(complement), i };
//             }

//             map.put(nums[i], i);
//         }

//         return new int[0];
//     }
// }`
//       }
//     ]
//   };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const problemData = response.data;

        setProblem(problemData);
        setCode(getInitialCodeForLanguage(problemData, selectedLanguage));
      } catch (error) {
        console.error('Error fetching problem:', error);
        setProblem(null);
        setFetchError(
          error.response?.data?.message ||
          error.response?.data ||
          'Unable to load this problem.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, selectedLanguage]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (problem) {
      setCode(getInitialCodeForLanguage(problem, language));
    }
  };

  const handleRun = async () => {
    if (executionLockRef.current) return;
    executionLockRef.current = true;
    setActiveExecution('run');
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: getRequestError(error, 'Internal server error'),
        testCases: []
      });
      setActiveRightTab('testcase');
    } finally {
      executionLockRef.current = false;
      setActiveExecution(null);
    }
  };

  const handleSubmitCode = async () => {
    if (executionLockRef.current) return;
    executionLockRef.current = true;
    setActiveExecution('submit');
    setCelebrationId(null);
    setSubmitResult(null);

    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       if (response.data?.accepted === true) {
         submissionCountRef.current += 1;
         setCelebrationId(submissionCountRef.current);
       }
       setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({ accepted: false, error: getRequestError(error, 'Unable to submit your solution. Please try again.') });
      setActiveRightTab('result');
    } finally {
      executionLockRef.current = false;
      setActiveExecution(null);
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => `difficulty-pill difficulty-${(difficulty || '').toLowerCase()}`;

  const resizePanels = (event) => {
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const nextWidth = ((event.clientX - bounds.left) / bounds.width) * 100;
    setLeftWidth(Math.min(65, Math.max(30, nextWidth)));
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (fetchError && !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="alert alert-error max-w-xl">
          <span>{fetchError}</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="alert alert-warning max-w-xl">
          <span>Problem data is unavailable.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell workspace" ref={workspaceRef}>
      <header className="workspace-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="icon-button" aria-label="Back to problems" onClick={() => navigate('/')}><ArrowLeft size={16} /></button>
          <BrandLogo />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</span>
          <button className="icon-button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>
      <div className="workspace-layout" style={{ '--left-width': `${leftWidth}%`, gridTemplateColumns: `${leftWidth}% 6px minmax(0, 1fr)` }}>
      {/* Left Panel */}
      <div className="workspace-pane">
        {/* Left Tabs */}
        <div className="workspace-tabs">
          <button
            className={`workspace-tab ${activeLeftTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveLeftTab('description')}
          >
            Description
          </button>
          <button
            className={`workspace-tab ${activeLeftTab === 'editorial' ? 'active' : ''}`}
            onClick={() => setActiveLeftTab('editorial')}
          >
            Editorial
          </button>
          <button
            className={`workspace-tab ${activeLeftTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setActiveLeftTab('solutions')}
          >
            Solutions
          </button>
          <button
            className={`workspace-tab ${activeLeftTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveLeftTab('submissions')}
          >
            Submissions
          </button>
          <button
            className={`workspace-tab ${activeLeftTab === 'ChatAI' ? 'active' : ''}`}
            onClick={() => setActiveLeftTab('ChatAI')}
          >
            ChatAI
          </button>
        </div>

        {/* Left Content */}
        <div className="workspace-content">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    <div className="badge badge-primary">{problem.tags}</div>
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {(problem.visibleTestCases || []).map((example, index) => (
                        <div key={index} className="bg-base-200 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono">
                            <div><strong>Input:</strong> {example.input}</div>
                            <div><strong>Output:</strong> {example.output}</div>
                            <div><strong>Explanation:</strong> {example.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.length ? problem.referenceSolution.map((solution, index) => (
                      <div key={index} className="border border-base-300 rounded-lg">
                        <div className="bg-base-200 px-4 py-2 rounded-t-lg">
                          <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-base-300 p-4 rounded text-sm overflow-x-auto">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) : <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-gray-500">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}
              {activeLeftTab === 'ChatAI' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    <ChatAI problem={problem} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="workspace-divider" role="separator" aria-orientation="vertical" aria-label="Resize workspace panels" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); resizePanels(event); }} onPointerMove={(event) => { if (event.buttons === 1) resizePanels(event); }} />
      {/* Right Panel */}
      <div className="workspace-pane">
        {/* Right Tabs */}
        <div className="workspace-tabs">
          <button
            className={`workspace-tab ${activeRightTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveRightTab('code')}
          >
            Code
          </button>
          <button
            className={`workspace-tab ${activeRightTab === 'testcase' ? 'active' : ''}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            Testcase
          </button>
          <button
            className={`workspace-tab ${activeRightTab === 'result' ? 'active' : ''}`}
            onClick={() => setActiveRightTab('result')}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="workspace-toolbar">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`quiet-button ${selectedLanguage === lang ? 'active' : ''}`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="editor-area" id="monaco-workspace-editor">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: { top: 14 },
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="editor-actions">
                <div className="flex gap-2">
                  <button
                    className="quiet-button"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="icon-button" title="Format code" aria-label="Format code" onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}><WandSparkles size={15} /></button>
                  <button className="icon-button" title="Full-screen editor" aria-label="Full-screen editor" onClick={() => document.getElementById('monaco-workspace-editor')?.requestFullscreen?.()}><Expand size={15} /></button>
                  <button
                    className="secondary-button"
                    onClick={handleRun}
                    disabled={activeExecution !== null}
                    aria-busy={activeExecution === 'run'}
                  >
                    {activeExecution === 'run' ? <><span className="button-spinner" />Running...</> : 'Run'}
                  </button>
                  <button
                    className="primary-button"
                    onClick={handleSubmitCode}
                    disabled={activeExecution !== null}
                    aria-busy={activeExecution === 'submit'}
                  >
                    {activeExecution === 'submit' ? <><span className="button-spinner" />Submitting...</> : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeExecution && <div className="execution-progress" role="status" aria-live="polite"><span className="execution-progress-bar" /><span>{activeExecution === 'run' ? 'Running visible test cases…' : 'Submitting to the full judge suite…'}</span></div>}

          {activeRightTab === 'testcase' && (
            <div className="console-panel">
              <h3 className="panel-title">Test results</h3>
              {runResult ? <RunResult result={runResult} /> : <div className="execution-empty">Run your code to see visible test case results here.</div>}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="console-panel">
              <h3 className="panel-title">Submission result</h3>
              {submitResult ? <SubmissionResult result={submitResult} celebrationId={celebrationId} /> : <div className="execution-empty">Submit your solution to evaluate it against the full judge suite.</div>}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProblemPage;
