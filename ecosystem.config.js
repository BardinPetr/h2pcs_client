module.exports = {
  apps: [
    {
      name: "H2Pcs",
      script: "index.js"
    }
  ],
  deploy: {
    production: {
      key: "~/.ssh/id_rsa",
      user: "pi",
      host: [process.env.DEPLOY_HOST || "192.168.43.129"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/master",
      repo: "git@github.com:BardinPetr/h2pcs_client.git",
      path: "/home/pi/h2pcs-client",
      "pre-deploy-local": "echo 'Deploy started'",
      "post-deploy":
        "npm install; pm2 startOrRestart ecosystem.config.js; pm2 restart ecosystem.config.js --env production --update-env"
    }
  }
};
