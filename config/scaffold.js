module.exports = {
    "node": {
        "info": "create a node project base gfe",
        "config": {
            "type": "github",
            "repos": "midday/gfe-node-project-template",
            "prompt": [{
                name: "project_name",
                description: "Enter your project name",
                type: "string",
                required: true,
                "default": "gfe-node-project"
            }],
            "roadmap": [{
                reg: "**",
                release: "/${project_name}/$&"
            }]
        }
    },
    "web": {
        "info": "create a web project base freemarker and gfe",
        "config": {
            "type": "github",
            "repos": "midday/gfe-web-project-template",
            "prompt": [{
                name: "project_name",
                description: "Enter your project name",
                type: "string",
                required: true,
                "default": "gfe-web-project"
            }],
            "roadmap": [{
                reg: "**",
                release: "/${project_name}/$&"
            }]
        }
    }
};
