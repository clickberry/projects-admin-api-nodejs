var express = require('express');
var moment=require('moment');
var config = require('clickberry-config');
var QueryParser = require('clickberry-query-parser').QueryParser;
var mongoDbProvider = require('clickberry-query-parser').mongoDbProvider;

var Projects = require('../models/project');

var Bus = require('../lib/bus-service');
var bus = new Bus({
    mode: config.get('node:env'),
    address: config.get('nsqd:address'),
    port: config.get('nsqd:port')
});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.get('/',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        new QueryParser({
            paramName: 'queryData',
            maxTop: 100,
            maxSkip: 100,
            filter: {
                name: {allow: true, rename: 'nameSort'},
                created: {allow: true},
                isPrivate: {allow: true},
                isHidden: {allow: true}
            },
            orderBy: {
                name: {allow: true, rename: 'nameSort'},
                created: {allow: true}
            }
        }, mongoDbProvider).parse,
        function (req, res, next) {
            console.log(req.queryData);
            Projects.find(req.queryData.query, null, {
                sort: req.queryData.sort,
                limit: req.queryData.limit || 10
            }, function (err, projects) {
                if (err) {
                    return next(err);
                }

                var projectDtos = projects.map(projectMap);
                res.send(projectDtos);
            });
        });

    router.delete('/:projectId',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        function (req, res, next) {
            Projects.findOneAndUpdate(
                {
                    _id: req.params.projectId,
                    deleted: {
                        $exists: false
                    }
                },
                {
                    deleted: moment.utc()
                },
                {
                    upsert: false
                }, function (err, doc) {
                    if(err){
                        return next(err);
                    }

                    console.log(doc);

                    bus.publishDeleteProject({id: req.params.projectId}, function () {
                        res.send();
                    });
                });
        });

    return router;
};

function projectMap(project) {
    return {
        projectId: project._id,
        userId: project.userId,
        name: project.name,
        created: project.created,
        isPrivate: project.isPrivate,
        isHidden: project.isHidden,
        deleted: project.deleted
    };
}
