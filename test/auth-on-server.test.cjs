var {auth, 
    startPrivateAuth, 
    endPrivateAuth} = require('@codingnninja/sapabase');
var expect = require('chai').expect;
var {Octokit} = require('@octokit/rest');

describe('authentication for user to connect with Github in Node', function() {

    context('authenticate without an argument', function() {
        it('should throw an error', function() {
            expect(function(){
                auth()
            }).to.throw(TypeError, "An object is expected but you supplied Undefined");
        })
    })

    context('authenticate with an object argument', function() {
        it('should return an instance of Octokit', function() {
            expect(
                auth({
                    username: 'codingnninja',
                    reponame: 'bloguard',
                    folder: 'user',
                    Octokit,
                })
            ).to.be.an.instanceof(Octokit);
        })
    })

    context('authenticate with non-object arguments', function() {
        const invalidOptions = [-1, 0, 1.5, 'not a number', [], undefined, null];
        for (const invalidOption of invalidOptions) {
            it(`should throw an error`, function() {
                expect(function(){
                    auth(invalidOption)
                }).to.throw(TypeError, `An object is expected but you supplied ${Object.prototype.toString.call(invalidOption).slice(8, -1)}`);//Object.prototype... is used to get the type of invalidOpition
            });
        }
    })

    context('authenticate with startPrivateAuth & endPrivateAuth in node', function() {
        it('should throw an error', function() {
            expect(function(){
                startPrivateAuth()
            }).to.throw("This function can only be used in the browser");
        })

        it('should throw an error', function() {
            expect(function(){
                endPrivateAuth()
            }).to.throw("This function can only be used in the browser");
        })
    })
})

