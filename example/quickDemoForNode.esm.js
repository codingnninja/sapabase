import {Octokit} from '@octokit/rest';
import {
    auth, 
    loadData,
    getDataById,
    storeDataInHTML,
    getDataFromHTML,
    deleteDataById,
    restoreDataById,
    isDataExist} from '@codingnninja/sapabase';
/* Public authentication and loading of data */
auth({
    username: 'codingnninja',
    reponame: 'bloguard',
    Octokit: Octokit,
    folder: 'user',
});

const myData = await loadData(1)
console.log(myData)
// storeDataInHTML(myData)
// const done = await restoreDataById(3);
// console.log(done);
// const done = await deleteDataById(1);
// console.log(done);
// const yes = await isDataExist(3);
// console.log(yes);
// const singleData = await getDataById(3);
// console.log(singleData); 