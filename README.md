[![npm version](https://badge.fury.io/js/@codingnninja%2Fsapabase.svg)](https://badge.fury.io/js/@codingnninja%2Fsapabase)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Sapabase

> Create your own "Serverless Database" with JavaScript and Github for your projects that need simple data.

## Prerequisites

This project works on all of the latest browsers and servers (e.g Node) and most of their old versions.
## Table of contents

- [Sapabase](#sapabase)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
    - [Installation on the server (e.g Node)](#Node)
    - [Installation on the browser](#Browser)
  - [Setting up Data Folder](#Setting-up-data-folder)
  - [API](#api)
    - [Authenticate with auth()](#auth())
      - [auth() in the Browser](#auth()-in-the-rowser)
      - [auth() on the server e.g Node](#auth()-on-the-server-e.g-node)
    - [loadData](#loadData())
    - [createOrUpdateData](#createOrUpdateData())
    - [storeDataInHTML](#storeDataInHTML())
    - [getDataFromHTML](#getDataFromHTML())
    - [getDataById](#getDataById())
    - [isDataExit](#isDataExit())
    - [deleteDataById](#deleteDataById())
    - [restoreDataById](#restoreDataById())
    - [resetTokenInBrowser](#resetTokenInBrowser())
  - [Contributing](#contributing)
  - [@Todo](#todo)
  - [Built With](#built-with)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Getting Started

These instructions will get you up and running with sapabase. Now, let's get started.
## Installation

**BEFORE YOU INSTALL:** please read the [prerequisites](#prerequisites)

Start by installing sapabase in your project as in below:

### Node

Install `sapabase` in node.

```sh
npm install @codingnninja/sapabase
```

Then you can import it.
```js
import { Octokit } from '@octokit/rest';
import {auth, loadData, createOrUpdate} from '@codingnninja/sapabase';


```

Or

```js
const {Octokit} = require('@octokit/rest');
const {auth, loadData, createOrUpdate} = require('@codingnninja/sapabase');
```

Sapabase supports `import` by default, so to use `require`, your file extension should be `.cjs` (We're currently fixing this interoperability issue). 
#### Quick demo

Get this [ESM demo file](/example/quickDemoForNode.esm.js) and run it in node.

Or

Get this [CJS demo file](/example/quickDemoForNode.cjs) and run it in node.
### Browser

Import Octokit and sapabase by adding the script below to your webpage.

#### Case 1: A Single HTML File
```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">

       import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
       import {auth, loadData} from "https://cdn.skypack.dev/@codingnninja/sapabase";
    </script>
  </body>
</html>
```

#### Case 2: Separating the JavaScript

We add this code to an HTML file to import our JavaScript code from `src/index.js`.

```html
  <!DOCTYPE html>
  <html>
    <body>
      <script type="module" src="/src/index.js"></script>
    </body>
  </html>
```
Here is the code in the src/index.js:

```js
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import {auth, loadData} from "https://cdn.skypack.dev/@codingnninja/sapabase";
```

#### Quick demo

Get this [demo file](/example/quickDemoForBrowser.html) and run it in the browser
## Setting up Data Folder

Create a folder named `data` in the root directory or in your existing project.

```
├── root
|   ├── data
|   |   ├── articles
```

You can also use a separate repository as your database. To do so, create a new repo and add a folder named `data` to it.

```
├── repository
|   ├── data
|   |   ├── article
```

Make sure the `data` folder is a child of the root directory. Also, any folder you want to fetch or store data in must contain the files below:

1. counter.json

```json
  {"index":0}
```

2. searchIndecesCounter.json

```json
  {"index":0}
```

2. folderName_0.json (e.g article_0.json)

```json
{
    "data": []
}
```
3. searchIndeces_0.json

```json
{
    "data": []
}
```

Note: If you're confused to add these files properly, check this example: [data folder and its subfolder](/data). Don't forget, data and any subfolder within it must contain those files for sapabase to work as expected.
## GitHub Token

To use this package, you must have a GitHub account. Then, create your GitHub token [Here](https://github.com/settings/tokens)
## API
### auth()
`auth()` authenticates users to use sapabase and it takes `option` as an argument. Option has six properties: `github-username`, `repository-name`, `folder`, `Octokit-instance`, `status` and `github-auth-token`.

#### auth() in the Browser

Authenticate to only GET public data. 

```js
const option = {
  username: 'your-github-username',
  reponame: 'repository-containing-your-data',
  folder: 'folder-to-store-and-get-data',
  Octokit,// Octokit instance
}

auth(option);
```

Whenever you want to `CREATE`, `UPDATE` OR `DELETE` data from the "Serverless Database", you need to be authenticated in the browser. 


```js
//
const deleteItem = (itemId) => {
//Ask for authentication to delete  
startPrivateAuth()

const isDataDeleted = await deleteDataById(itemId);
if(isDataDeleted){
  //do something
}
//Switch back to public
endPrivateAuth()
}
```

#### auth() on the server e.g Node

Authenticate to `GET`, `CREATE`, `UPDATE` or `DELETE` data from your sapabase "Serverless Database". 

```js
const option = {
  username: 'your-github-username',
  reponame: 'repository-containing-your-data',
  folder: 'folder-to-store-and-get-data',
  Octokit,// Octokit instance
  token: 'your-github-auth-token'
}
auth(option);
```

We recommend you get your token from .env file using `process.env` .

Note: You don't need `startPrivateAuth()` and  `endPrivateAuth()` on the server. They're only used to authenticate in the browser.
### loadData()

`loadData()` gets data from the folder you set in `auth()` by default. 

#### When the folder property in `auth()` is set to 'users'
```js

// Get the first page of items from `repo/data/users`
const data = await loadData();
//Or
const data = await loadData(1)

const nextData = await loadData(2)
```

#### When the folder in `auth()` is undefined or set to an empty string

```js

// Get the first page of items from `repo/data`
const data = await loadData();
console.log(data)
//Or
const data = await loadData(1)
console.log(data)

const nextData = await loadData(2)
console.log(data)
```

You can specify the folder you want to use in the API to override the one you set in `auth()`

```js
//Get users from `repo/data/users`
const users = await loadData(1, 'users');
console.log(users)

//Get students from `repo/data/school/students`
const students = await loadData(1, 'school/student');
console.log(students)

```

### createOrUpdateData()

It stores or updates data in the sapabase "Serverless Database" and returns the data inserted. It takes `data` and `folder (optional)` as arguments.

#### When folder in `auth()` is set to 'users'

```js
//It creates or update the data in repo/data/users
const createOrUpdatedData = await createOrUpdateData(data);
console.log(createOrUpdatedData)
```

#### When folder in `auth()` is undefined or set to an empty string

```js
//It creates or update the data in repo/data
const createOrUpdatedData = await createOrUpdateData(data);
console.log(createOrUpdatedData)

/* Set folder path as an argument of the API to override the one set in auth()*/
const createOrUpdatedData = await createOrUpdateData(data, 'school/students');
console.log(createOrUpdatedData)
```
### storeDataInHTML()

It only works in the browser and takes an argument.

```js
const data = await loadData(1);
storeDataInHTML(data);
```
### getDataFromHTML()

It only works in the browser and takes no argument.

```js
const data = getDataFromHTML();
console.log(data);
```
### getDataById()

It gets a single data by Id and it returns an object. It takes two arguments: getDataById(dataId, folderPath)

```js
/* When the folder in auth() is set to users */

//It gets data by id from repo/data/users
const singleData = await getDataByID(dataId);

/* When the folder in auth() is set to an empty string or it is not defined*/

//It gets data by id from repo/data
const singleData = await getDataByID(dataId);

/* Set folder path as an argument of the API*/
//It gets data by id from repo/data/school/students
const singleData = await getDataByID(dataId, 'school/students');
```
### isDataExit()

It checks if the item with the given ID exists and returns true or false. It takes two arguments: isDataExit(dataID, folderPath)

```js
/* When the folder in auth() is set to users */
// check if data exist in  repo/data/users
const singleDataStatus = await isDataExist(dataId);


/* When the folder in auth() is set to an empty string or it is not defined*/
// check if data exist in repo/data
const singleDataStatus = await isDataExist(dataId);

/* Set folder path as an argument of the API*/
// check if data exist in repo/data/school/students
const singleDataStatus = await isDataExist(dataId, 'school/students');
```
### deleteDataById()

It deletes data by id and returns true or false. It takes two arguments: deleteDataById(dataID, folderPath)

```js
/* When the folder in auth() is set to users */
// delete data from repo/data/users
const singleDataStatus = await deleteDataById(dataId);


/* When the folder in auth() is set to an empty string or it is not defined*/
// delete data from repo/data
const singleDataStatus = await deleteDataById(dataId);

/* Set folder path as an argument of the API*/
// delete data from repo/data/school/students
const singleDataStatus = await deleteDataById(dataId, 'school/students');
```
### restoreDataById()

It restores data by id and returns true or false. It takes two arguments: restoreDataById(dataID, folderPath)

```js
/* When the folder in auth() is set to users */
// restore data from repo/data/users
const singleDataStatus = await restoreDataById(dataId);


/* When the folder in auth() is set to an empty string or it is not defined*/
// restore data from repo/data
const singleDataStatus = await restoreDataById(dataId);

/* Set folder path as an argument of the API*/
// restore data from repo/data/school/students
const singleDataStatus = await restoreDataById(dataId, 'school/students');
```
### resetTokenInBrowser()

It resets token in the browser. It takes no argument.

```js
resetTokenInBrowser();
```
### startPrivateAuth() && endPrivateAuth()

They initiate authentication in the browser.

```js
const addOrUpdate = (data) => {
//Ask for authentication to delete  
startPrivateAuth()

const updatedData = await createOrUpdateData(data);
if(updatedData){
  //do something
}
//Switch back to public
endPrivateAuth()
}
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork this repo!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request : and boom!

## @Todo

1. Port to Typescript to fix import and require interoperability issue.

## Built With

* Octokit 
* Love of teaching and learning
## Versioning

We use [SemVer](http://semver.org/) for versioning. 

## Authors

* **Ayobami Ogundiran** - [Codingnninja](https://github.com/codingnninja)

Why not star this on github? I'd love the attention! Why not share the link for this repository on Twitter or HackerNews? Spread the news!

Don't forget to follow me on Twitter @ [codingnninja](https://twitter.com/codingnninja)

Thank you! Ayobami Ogundiran.

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Ayobami Ogundiran