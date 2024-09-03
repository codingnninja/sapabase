let octo = null;

let __options = {
    username: '',
    reponame: '',
    folder: '',
    indexDB: null,
    searchIndeces: null,
    control: false,
    page: 0,
    pageJump: false
}

const isBrowser = (_) => {
    // Check if the environment is Node.js
    if (typeof process === "object" &&
        typeof require === "function") {
        return false;
    }
    // Check if the environment is a
    // Service worker
    if (typeof importScripts === "function") {
        return false;
    }
    // Check if the environment is a Browser
    if (typeof window === "object") {
        return true;
    }
}

const auth = (options) => {
    let inBrowserToken;
    if(!isObject(options)) {
        throw new TypeError(`An object is expected but you supplied ${getType(options)}`)
    }

    if(isBrowser()) {
        inBrowserToken = localStorage.getItem('sapatoken') ? localStorage.getItem('sapatoken') : '';
    }

    if(inBrowserToken === 'null' || inBrowserToken === '') {
        inBrowserToken = '';
    }

    if(isBrowser() && options.status === 'private' && !options.token && !inBrowserToken) {
        const token = prompt('Enter Github Auth Token:');
        if(!token) return;
        localStorage.setItem('sapatoken', token);
        inBrowserToken = token;
    }

    options.token = options.token ? options.token : inBrowserToken;
    __options = {...__options, ...options};
    const Octokit = options.Octokit;
    octo = new Octokit({ 'auth': __options.token });
    return octo;
}

const resetTokenInBrowser = (_) => {  
    if(!isBrowser()){
        throw('This function can only be used in the browser')
    }

    if(!localStorage.removeItem('sapatoken')){
        return false;
    }
    return true;
}

const startPrivateAuth = (_) => {
    if(!isBrowser()){
        throw('This function can only be used in the browser')
    }
    __options.status = 'private';
    auth(__options);
    return __options.status === 'private';
}

const endPrivateAuth = (_) => {
    if(!isBrowser()){
        throw('This function can only be used in the browser')
    }
    __options.status = '';
    auth(__options)
    return __options.status === '';
}

const createCommit = async (options, data) => {
    try {
     
        const baseURL = makeBaseURL(options, 'PUT');
        const url = `${baseURL + data.filePath}`;
        
        const request = await octo.request(url, {
        message: 'create or update data',
        committer: {
            name: 'Ayobami Ogundiran',
            email: 'ayobami_ogundiran@yahoo.com'
        },
        content: Base64.encode(data.content),
        sha: data.sha 
        })
        return request;
    } catch (err) {
        return {
            status: 'failed',
            error: err
        }
    }
}

const getFile = async (options, filePath) => {
    try {
            const baseURL = makeBaseURL(options, 'GET');
            const url = `${baseURL + filePath}`;
    
            const request = await octo.request(`${url}?ref=main`);
            return request.data;

    } catch (err) {
        return {
            status: 'failed',
            error: err
        }    
    }
}

const Base64 = {
    encode(text) {
        const encodedString = isBrowser()
                     ? btoa(encodeURIComponent(text))
                     : Buffer.from(encodeURIComponent(text)).toString('base64')
        return encodedString;
    },
    decode(base64) {
        const decodedString = isBrowser()
                     ? decodeURIComponent(atob(base64))
                     : decodeURIComponent(Buffer.from(base64, 'base64').toString())
        return decodedString;
    }
}

const loadData = async (counter = 1, folder = __options.folder) => {
    if(!isPositiveInteger(counter)) {
        throw (`A whole number like 1, 2, 3 is expected but you supplied something else like 0, -2, text, array or object`);
    }
    //We only allow integers (number starting from 1) from users and we convert it back to index (number starting from zero).

    let pagination = __options.pageJump ? counter : counter - 1;
    
    if(__options.page === counter) {
        pagination -= 1;
    } 
    // __options.page = __options.pageJump ? counter : counter - 1; 
    const currentCountData = await getFilePaginationCount(folder);
    const fileIndex = currentCountData.fileCounter;
    //when no page index is provided, get the latest file index.
    // const currentFileIndex = fileIndex >= __options.page 
    //         ? fileIndex - __options.page 
    //         : null;
    const currentFileIndex = fileIndex >= pagination 
            ? fileIndex - pagination 
            : null;
    const latestData = await getJsonDataFromFile(currentFileIndex, folder);
    __options.page = currentFileIndex ? counter : counter - 1; 
    console.log(__options.page, counter);  
    let previousData;
    
    if(latestData.length === 0 && fileIndex === 0){
        return latestData;
    }
    //When the data in the latest file is less or equal to 7, 
    //we merge it with the previous data to make sure the 
    //items on the current page is not 1 or <= 7. 
    //This is necessary because we have divided json files 
    //and doing this helps us sync the data in the latest file to the previous one when it contains items less than 7.
    if( fileIndex > pagination && latestData.length <= 7) {
        __options.pageJump = true;
        previousData = await getJsonDataFromFile(currentFileIndex - 1, folder);
        return[...latestData, ...previousData];
    }

    return latestData;
}

const getJsonDataFromFile = async (currentFileIndex, folder) => {
    const currentFilePath = makeDataFilePath(folder, currentFileIndex);
    
    const data = await getFile(__options, currentFilePath);
    
    if(data.status === 'failed') {
        return data;
    }

    const content = JSON.parse(Base64.decode(data.content));

    const availableData = content.data.filter(datum => datum.deleted !== true)
    return availableData; 
}

const storeDataInHTML = (data) => {

    if(!isBrowser()) {
        throw ('This function is only for the browser');
    }

    let newScript = document.createElement('script');
    let inlineScript = document.createTextNode(`window.__data = ${JSON.stringify(data)}`);
    newScript.appendChild(inlineScript);  
    document.body.appendChild(newScript);
}

const getDataFromHTML = () => {

    if(!isBrowser()) {
        throw ('This function is only for the browser');
    }

   return window.__data;
}

const normalizeDatabase = async (folder = __options.folder, file) => {
  const nextFile = await getDataFromFile(folder, file.index + 1);
  if(nextFile.status === 'failed'){
    console.log('working')
    return false;
  }
  const currentCountData = await getFilePaginationCount(folder);
  const updatedCounter = await updateFilePaginationCount(folder, currentCountData)

  if(updatedCounter.status === 'failed') {
    console.log('working')
    return false;
  }

  __options.control = true;
        const restructuredData = shorthenValuesOfObjectProperties(file.content[0]);
        restructuredData.fileIndex = updatedCounter;
        await __createOrUpdateData(folder, restructuredData)
  __options.control = false;
}

const createOrUpdateData = async (userData, folder = __options.folder) => {
   //TODO: check if folder path is a string.
    if(!isObject(userData)) {
        throw (`An object is expected but you supplied ${getType(userData)}`)
    }
    //the function is expected to return the index of the file the data is inserted.
    const updatedData = await __createOrUpdateData(folder, userData);
    
    if(updatedData.fileIndex >= 0) {
        __options.control = true;
        const restructuredData = shorthenValuesOfObjectProperties(userData);
        restructuredData.fileIndex = updatedData.fileIndex;
        await __createOrUpdateData(folder, restructuredData)
    }
    return updatedData.content;
}

const __createOrUpdateData = async (folder = __options.folder, userData) => {

   const file = await getDataFromFile(folder);
   await normalizeDatabase(folder, file);
   
   const isContentFull = hasReachedMaxDataLength(file.content);
   userData.fileIndex = file.index;

   const latestData = addLatestIdToData(file.content, userData);
   const allData = isContentFull ? [latestData]
                 : mergeData(file.content, latestData);

   const currentFilePath = isContentFull ? makeDataFilePath(folder, (file.index + 1)) : file.path;

   const createdCommit = await createCommit(__options, 
    {
        filePath: currentFilePath,
        content: JSON.stringify( { data:allData } ),
        sha: isContentFull ? '' : file.sha
    });

    if(createdCommit.status === 'failed') {
        return createdCommit;
    }

    if(  createdCommit.status === 201 && isContentFull ){
        const currentCountData = await getFilePaginationCount(folder);
        const updatedCounter = await updateFilePaginationCount(folder, currentCountData);

        if(updatedCounter.status !== 201){
            await updateFilePaginationCount(folder, file.counter);
        }
        
        __options.control = false;
        return {content: latestData, fileIndex: file.index + 1};
   }
   return {content: latestData, fileIndex: file.index};
}

const getDataFromFile = async (folder = __options.folder, fileIndex) => {
    const currentCountData = await getFilePaginationCount(folder);
    const currentFileIndex = fileIndex >= 0 ? fileIndex
                           : currentCountData.fileCounter;

    let currentFilePath = makeDataFilePath(folder, currentFileIndex);
 
    const file = await getFile(__options, currentFilePath);
    if(file.status === 'failed') {
        return file;
    }
    const fileContent = JSON.parse(Base64.decode(file.content));

    return {
        index:currentFileIndex,
        path:currentFilePath,
        content:fileContent.data,
        sha: file.sha,
    }
}

const addLatestIdToData = (allData, singleData) => {
    if(singleData.id){
        return singleData;
    }
    const currentDataId = makeDataId(allData);
    singleData.id = currentDataId;
    singleData.createdAt = new Date();

    return singleData;
}

const mergeData = (allData, newData) => {
    if(newData.id < allData.length) {
        return updateDataLocally(allData, newData)
    }
    return [newData, ...allData];
}

const updateDataLocally = (allData, updatedData) => {
    const updatedAllData = allData.map( data => {
        if(data.id === updatedData.id) {
            data = updatedData;
            data.updatedAt = new Date();
        }
        return data;
    });
    return updatedAllData;
}

const hasReachedMaxDataLength = (data) => {
    if(data.length < 20) {
        return false;
    } else if(__options.control && data.length < 200) {
        return false
    }
    return true;
    // const size = new TextEncoder().encode(JSON.stringify(data)).length
    // const fileSizeInKiloBytes = size / 1024;
    // console.log(fileSizeInKiloBytes, 'test', options.fileSize)
    // const fileSizeInMegaBytes = kiloBytes / 1024;
    // return fileSizeInKiloBytes >= 20;           
}

const getSearchIndecesFile = async (fileIndex, folder = __options.folder) => {
    const currentCountData = await getFilePaginationCount(folder);
    const currentFileIndex = fileIndex >= 0
            ?  fileIndex
            : currentCountData.fileCounter;//get latest file index

    __options.control = true;//this is to remined makeDataFilePath to create path for searchIndeces.
    const currentFilePath = makeDataFilePath(folder, currentFileIndex);

    const data = await getFile(__options, currentFilePath);
    if(data.status === 'failed') {
        return data;
    }
    __options.control = false; // this is to tell to go back to normal

    const content = JSON.parse(Base64.decode(data.content));
    const availableData = content.data.filter(datum => datum.deleted !== true)
    __options.searchIndeces = availableData;
    if(content.data) {
        return availableData; 
    }
    return false;
}

const shorthenValuesOfObjectProperties = (obj) => {
    const objectWithShorthenedPropertyValues = {};
    for (const key in obj) {
        if(typeof obj[key] === 'string') {
            const truncatedString = truncateString(obj[key], 60);
            objectWithShorthenedPropertyValues[key] = truncatedString;
        }
    }
    return objectWithShorthenedPropertyValues;
}

const truncateString = (string, number) => {
    // If the length of string is less than or equal to number
    // just return string--don't truncate it.
    if (string.length <= number) {
      return string
    }
    // Return string truncated with '...' concatenated to the end of string.
    return string.slice(0, number) + '...'
}


const makeBaseURL = (options, action) => {
    return `${action} /repos/${options.username}/${options.reponame}/contents/`;
}

const getFilePaginationCount = async (folder = __options.folder) => {
    const currentModelCounterFile = makeCounterFilePath(folder)
    const data = await getFile(__options, currentModelCounterFile);
    if(data.status === 'failed') {
        return data;
    }
    const fileCounter = JSON.parse(Base64.decode(data.content));
    return {
        fileCounter: fileCounter.index,
        sha: data.sha
    };
}

const updateFilePaginationCount = async (folder = __options.folder, currentCounterData) => {
    const currentModelCounterFile = makeCounterFilePath(folder)
    const updatedFileIndex = currentCounterData.fileCounter + 1;
    let dataToSend = {
        filePath: currentModelCounterFile,
        content: JSON.stringify( { index:updatedFileIndex } ),
        sha: currentCounterData.sha
    }
    // currentCounterData.fileCount = updatedFileIndex;
    const createdCommit = await createCommit(__options, dataToSend);
    
    if(createdCommit.status === 'failed') {
        return createdCommit;
    }
    return updatedFileIndex;
}

const makeDataId = (data) => {
    if( Array.isArray(data) && !data.length ){
        return 1;
    }
    //Pick the latest data in this file since the array is in reverse.
    let lastestChildData = data[0]; 
    return lastestChildData.id + 1;
}

const makeDataFilePath = (folder = __options.folder, counter) => {

    if(__options.control) {
        const searchIndecesPath = makeSearchIndecesPath(folder, counter);
        return searchIndecesPath;
    }
    
    return folder ? `data/${folder}/${folder}_${counter}.json`
            : `data/data_${counter}.json`
}

const makeCounterFilePath = (folder = __options.folder) => {
    if(__options.control) {
        return folder ? `data/${folder}/searchIndecesCounter.json`
        : `data/searchIndecesCounter.json`
    }

    return folder ? `data/${folder}/counter.json`
            : `data/counter.json`
}

const makeSearchIndecesPath = (folder = __options.folder, counter) => {
    return folder ? `data/${folder}/searchIndeces_${counter}.json`
            : `data/searchIndeces_${counter}.json`
}

const getFileIndexWithChildDataId = (dataId) => {
    if(!isPositiveInteger(dataId)) {
        throw (`A whole number like 1, 2, 3 is expected but you supplied something else  like 0, -2, text, array or object`);
    }
   const fileSize = __options.control ? 200 : 20;
   const approxFileIndex = ((dataId - 1)/fileSize).toFixed(9).split('.');
   return Number(approxFileIndex[0]); 
}

const getDataById = async (dataId, folder = __options.folder) => {
    
    let fileIndex = getFileIndexWithChildDataId(dataId);
    const file = await getDataFromFile(folder, fileIndex);
    
    const data = file.content;
    const foundData = searchDataById(data, dataId);
    return foundData;
    
}

const isDataExist = async (dataId, folder = __options.folder) => {
    const data = await getDataById(dataId, folder);
    if(!data) {
        return false;
    }
    return data.id === dataId;
}

const isDeleted = (data, dataId) => {
    const datum = searchDataById(data, dataId)
    if(datum.hasOwnProperty('deleted')){

        if(datum.deleted === true) {
            return true;
        } else {
            return false;
        }
    }  
    return false;
}
const restoreDataInFile = async (dataId, folder = __options.folder) => {
    if(!__options.token && __options.status !== 'private') {
        throw ('You need to set status or token to use this.')
    }
  
    let fileIndex = getFileIndexWithChildDataId(dataId)
    const file = await getDataFromFile(folder, fileIndex)
    const data = file.content;

    if(isDeleted(data, dataId) === false){
        return true;
    }

    const updatedData = data.map( datum => {
        if(datum.id === dataId) {
            datum.deleted = false;
            datum.restoredAt = new Date();
        }
        return datum;
    });

    const createdCommit = await createCommit(__options, 
        {
            filePath: file.path,
            content: JSON.stringify( { data:updatedData } ),
            sha: file.sha
        });
    return createdCommit.status === 200 ? true : createdCommit; 
}

const restoreDataInSearchIndeces = async (dataId, folder = __options.folder) => {
    __options.control = true;//control set to true means, it will restore the deleted data from the searchindeces file instead of data file.
    const restoredDataInSearchIndeces = await restoreDataInFile(dataId, folder);
    // this switches back to data file as the main.
    __options.control = false; 
    return restoredDataInSearchIndeces; 
}

const restoreDataById = async (dataId, folder = __options.folder) => {
    const restoredDataInFile = await restoreDataInFile(dataId, folder);
    if(restoredDataInFile) {
       await restoreDataInSearchIndeces(dataId, folder);
    }
    return restoredDataInFile
}

const deleteDataFromFile = async (dataId, folder = __options.folder) => {
    if(!__options.token && __options.status !== 'private') {
        throw ('You need to set status or token to use this.')
    }
    //data will be deleted from main data file.
    let fileIndex = getFileIndexWithChildDataId(dataId);
    const file = await getDataFromFile(folder, fileIndex)
    const data = file.content;

    if(isDeleted(data, dataId)){
        return true;
    }

    const updatedData = data.map( datum => {
        if(datum.id === dataId) {
            datum.deleted = true;
        }
        return datum;
    });
                     
    const createdCommit = await createCommit(__options, 
        {
            filePath: file.path,
            content: JSON.stringify( { data:updatedData } ),
            sha: file.sha
        });
    return createdCommit.status === 200 ? true : createdCommit; 
}

const deleteDataFromSearchIndeces = async (dataId, folder = __options.folder) => {
    __options.control = true;//control set to true, it will delete from searchindeces file instead of data file.
    const deletedDataFromSearchIndeces = await deleteDataFromFile(dataId, folder);
    __options.control = false; // this switches back to data file as the main
    return deletedDataFromSearchIndeces; 
}

const deleteDataById = async (dataId, folder = __options.folder) => {
    const deletedDataFromFile = await deleteDataFromFile(dataId, folder);
    if(deletedDataFromFile) {
       await deleteDataFromSearchIndeces(dataId, folder);
    }
    return deletedDataFromFile;
}

const searchDataById = (allData, singleDataId) => {
    const data = [...allData];
    const reversedData = data.reverse();
    const searchTerm = singleDataId;
    let firstIndex = 0
    let lastIndex = allData.length - 1;
    let result = null;

    for(let index = 0; index < reversedData.length; index++ ) {
        const midpoint = Math.floor((lastIndex + firstIndex) / 2);
        const itemAtMidpoint = reversedData[midpoint] ? reversedData[midpoint] : {id: reversedData.length};
        //This is the code to achieve constant search (which I invented/discovered) and we use it here to optimize binary search. We should use it alone as we only use soft delete.
        
        if( reversedData[searchTerm - 1] && searchTerm === reversedData[searchTerm - 1].id ) {
            result = reversedData[searchTerm - 1];
        }
        
        if (searchTerm === itemAtMidpoint.id ) {
            result = itemAtMidpoint;
        }
        
        if ( itemAtMidpoint.id > searchTerm ) {
            lastIndex = midpoint - 1;
        }
        
        if ( itemAtMidpoint.id < searchTerm ) {
            firstIndex = midpoint + 1;
        }
    }
    return result;
}

const isObject = (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const isArray = (value) => {
    return Array.isArray(value);
}

const isPositiveInteger = (value) => {
    return Number.isInteger(value) && value > 0 ;
}

const getType = (value) => {
    return Object.prototype.toString.call(value).slice(8, -1);
}

export {
    loadData,
    getDataFromHTML,
    getFile,
    createOrUpdateData,
    storeDataInHTML,
    getDataById,
    deleteDataById,
    restoreDataById,
    isDataExist,
    auth,
    resetTokenInBrowser,
    startPrivateAuth,
    endPrivateAuth
}