/* To use require() make sure you file extension is .cjs because this module support import by default. We're currently fixing this interoperability issue*/

const {Octokit} = require('@octokit/rest');
const {auth, loadData} = require('@codingnninja/sapabase');
auth({
    username: 'codingnninja',
    reponame: 'bloguard',
    folder: 'user',
    Octokit,
});

const myData = loadData();
myData.then( (datum) => {
    console.log(datum);
})