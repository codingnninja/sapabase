var {auth,loadData} = require('@codingnninja/sapabase');
var expect = require('chai').expect;
var {Octokit} = require('@octokit/rest');

describe('Loading data from a Github repo', function() {

    context('Loading data without an argument', function() {
        it('should return the items in the latest file', async function() {
            this.timeout(3000)
            auth({
                username: 'codingnninja',
                reponame: 'bloguard',
                folder: 'user',
                Octokit
            })  
            const actual = await loadData();
            const expected = await loadData(1);       
            expect(actual).to.be.an('array');
            expect(actual.length).to.equal(expected.length);
        })
    })

})