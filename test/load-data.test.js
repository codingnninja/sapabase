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
})