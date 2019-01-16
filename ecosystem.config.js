module.exports = {
  apps: [
    {
      name: "H2Pcs",
      script: "index.js"
    }
  ],
  deploy: {
    production: {
      key: "$HOME/.ssh",
      user: "pi",
      host: ["192.168.43.129"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/master",
      repo: "https://bitbucket.org/BardinPetr/h2pcs-client",
      path: "/home/pi/h2pcs-client",
      "pre-deploy-local": "echo 'Deploy started'",
      "post-deploy":
        "npm install; pm2 startOrRestart ecosystem.config.js; pm2 restart ecosystem.config.js --env production --update-env"
    }
  }
};
