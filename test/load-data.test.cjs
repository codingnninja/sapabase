var {auth,loadData} = require('@codingnninja/sapabase');
var expect = require('chai').expect;
var {Octokit} = require('@octokit/rest');

describe('Loading data from a Github repo with internet', function() {

    context('Loading data without an argument', function() {
        it('should return the array of items in the latest file', async function() {
            this.timeout(10000)
            auth({
                username: 'codingnninja',
                reponame: 'bloguard',
                folder: 'user',
                Octokit
            })  
            const actual = await loadData();
            const expected = await loadData(1); 
            expect(actual).to.be.an('array');
            expect(actual).to.eql(expected);
        })
    })

    context('Loading data with an argument: incrementing the argument', function() {
        it('should return the ID of the last item in the previous is greater than the ID of the first item in the current data', async function() {
            this.timeout(10000)
            auth({
                username: 'codingnninja',
                reponame: 'bloguard',
                folder: 'user',
                Octokit
            })  
            const previous = await loadData(1);
            const current = await loadData(2);       
            expect(current).to.be.an('array');
            expect(previous[previous.length - 1].id).to.be.greaterThan(current[0].id);
        })
    })

    context('Loading data with two argument and overriding folder path set in auth', function() {
        it('should return actual is equal to expected', async function() {
            this.timeout(12000)
            auth({
                username: 'codingnninja',
                reponame: 'bloguard',
                folder: 'user',
                Octokit
            })  
            const expected = await loadData(1);
            const actual = await loadData(1, 'user');       
            expect(actual).to.be.an('array');
            expect(actual).to.eql(expected);
        })
    })

    context('Loading data that is not available', function() {
        it('should throw an error', async function() {
            this.timeout(12000)
            auth({
                username: 'codingnninja',
                reponame: 'bloguard',
                folder: 'user',
                Octokit
            })  
            const expected = await loadData(4);
            expect(expected.status).to.be.equal('failed');
        })       
    })
})


// const { expect } = require('chai');
// const { loadData } = require('./loadData');

// describe('loadData', () => {
//   it('throws an error if counter is not a positive integer', async () => {
//     const invalidCounters = [-1, 0, 1.5, 'not a number', [], {}];
//     for (const counter of invalidCounters) {
//       await expect(loadData(counter)).to.be.rejectedWith(`A whole number like 1, 2, 3 is expected but you supplied something else like 0, -2, text, array or object`);
//     }
//   });

//   it('returns an empty array if the latest file is empty and there are no previous files', async () => {
//     const folder = 'test-folder';
//     const currentCountData = { fileCounter: 0 };
//     const getJsonDataFromFile = () => Promise.resolve([]);
//     const getFilePaginationCount = () => Promise.resolve(currentCountData);
//     const result = await loadData(1, folder, { getJsonDataFromFile, getFilePaginationCount });
//     expect(result).to.deep.equal([]);
//   });

//   it('returns the latest data if it contains more than 7 items', async () => {
//     const folder = 'test-folder';
//     const currentCountData = { fileCounter: 1 };
//     const latestData = [1, 2, 3, 4, 5, 6, 7, 8];
//     const getJsonDataFromFile = () => Promise.resolve(latestData);
//     const getFilePaginationCount = () => Promise.resolve(currentCountData);
//     const result = await loadData(1, folder, { getJsonDataFromFile, getFilePaginationCount });
//     expect(result).to.deep.equal(latestData);
//   });

//   it('merges the latest data with the previous data if both contain less than or equal to 7 items', async () => {
//     const folder = 'test-folder';
//     const currentCountData = { fileCounter: 2 };
//     const latestData = [1, 2, 3, 4];
//     const previousData = [5, 6, 7];
//     const expectedMergedData = [...latestData, ...previousData];
//     const getJsonDataFromFile = (index) => {
//       if (index === currentCountData.fileCounter - 1) {
//         return Promise.resolve(previousData);
//       } else {
//         return Promise.resolve(latestData);
//       }
//     };
//     const getFilePaginationCount = () => Promise.resolve(currentCountData);
//     const result = await loadData(2, folder, { getJsonDataFromFile, getFilePaginationCount });
//     expect(result).to.deep.equal(expectedMergedData);
//   });
// });

//write a test for the code below with mocha and chai and make sure you test for all kind of datatypes
