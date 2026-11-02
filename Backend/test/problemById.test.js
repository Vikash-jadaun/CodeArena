const test = require('node:test');
const assert = require('node:assert/strict');

const controller = require('../src/Controllers/userProblem');
const Problem = require('../src/modules/problem');
const SolutionVideo = require('../src/modules/solutionVideo');

test('getProblemById responds with the problem even when no video exists', async () => {
  const problemDoc = {
    toObject() {
      return {
        _id: 'p1',
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target.',
        difficulty: 'Easy',
        tags: 'array',
        visibleTestCases: [],
        startCode: []
      };
    }
  };

  Problem.findById = async () => ({
    select: () => problemDoc
  });
  SolutionVideo.findOne = async () => null;

  let statusCode;
  let jsonData;

  const req = { params: { id: 'p1' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonData = data;
      return this;
    },
    send(data) {
      return data;
    }
  };

  await controller.getProblemById(req, res);

  assert.equal(statusCode, 200);
  assert.deepEqual(jsonData, {
    _id: 'p1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target.',
    difficulty: 'Easy',
    tags: 'array',
    visibleTestCases: [],
    startCode: []
  });
});
