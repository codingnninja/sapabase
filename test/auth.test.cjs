var {
    auth, 
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
        it('should throw a number related error', function() {
            expect(function(){
                auth(4)
            }).to.throw(TypeError, "An object is expected but you supplied Number");
        })

        it('should throw a string related error', function() {
            expect(function(){
                auth('')
            }).to.throw(TypeError, "An object is expected but you supplied String");
        })

        it('should throw a boolean related error', function() {
            expect(function(){
                auth(true)
            }).to.throw(TypeError, "An object is expected but you supplied Boolean");
        })

        it('should throw array related error', function() {
            expect(function(){
                auth(['ayoba', 1])
            }).to.throw(TypeError, "An object is expected but you supplied Array");
        })

        it('should throw function related error', function() {
            expect(function(){
                auth(() => {return 'a'} )
            }).to.throw(TypeError, "An object is expected but you supplied Function");
        })
    })
})

