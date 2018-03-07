const watchbot = require('@mapbox/watchbot');
const cf = require('@mapbox/cloudfriend');

const mbp = {
    Parameters: {
        GitSha: {
            Description: "The Git SHA to deploy",
            Type: "String",
            Default: "master"
        },
        Cluster: {
            Type: "String",
            Default: "machine-ecs-production"
        },
        AlarmEmail: {
            Type: "String",
            Default: "ingalls@protonmail.com"
        }
    }
};

// Generate Watchbot resources. You can use references to parameters and
// resources that were defined above.
const watch = watchbot.template({
    cluster: cf.join('', ['arn:aws:ecs:', cf.ref('AWS::Region'), ':', cf.ref('AWS::AccountId'), ':cluster/', cf.ref('Cluster')]),
    service: 'machine-tiler',
    serviceVersion: cf.ref('GitSha'),
    env: { GitSha: cf.ref('GitSha') },
    workers: 10,
    reservation: { softMemory: 1024, cpu: 1024 },
    notificationEmail: cf.ref('AlarmEmail'),
    permissions: [{
            Effect: "Allow",
            Action: [ "cloudwatch:PutMetricData", "autoscaling:DescribeAutoScalingInstances" ],
            Resource: [ "*" ]
        }, {
            Effect: "Allow",
            Action: [ "s3:ListBucket", "s3:PutObject", "s3:PutObjectAcl", "s3:GetObject", "s3:HeadObject" ],
            Resource: [ "arn:aws:s3:::dotmaps.openaddresses.io", "arn:aws:s3:::dotmaps.openaddresses.io/*" ]
        },
        {
            Effect: "Allow",
            Action: [ "s3:ListBucket", "s3:GetObject", "s3:HeadObject" ],
            Resource: [ "arn:aws:s3:::results.openaddresses.io", "arn:aws:s3:::results.openaddresses.io/*" ]
        }
    ]
});

const outputs = { Outputs: { SnsTopic: { Value: watch.ref.topic } } };

module.exports = watchbot.merge(mbp, watch, outputs);
