var nodegit = require("../");
var path = require("path");

var repoDir = process.argv[2] || process.argv[3];
var repository;


setInterval(() => {
    nodegit.Repository.open(repoDir)
        .then(function (repo) {
            repository = repo;

            return repository.fetchAll({
                callbacks: {
                    credentials: function (url, userName) {
                        return nodegit.Cred.sshKeyFromAgent(userName);
                    },
                    certificateCheck: function () {
                        return 1;
                    }
                }
            });
        })
        .then(function () {
            return repository.mergeBranches("master", "origin/master");
        })
        .done(function () {
            console.log("Done!");
        });
}, 1 * 60 * 1000)