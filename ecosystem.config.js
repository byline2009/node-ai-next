module.exports = {
  apps: [
    {
      script: "npm start",
      watch: ".",
    },
    {
      script: "./service-worker/",
      watch: ["./service-worker"],
    },
  ],

  deploy: {
    production: {
      key: "key-pair-1.pem", // pem file generated when launching an instance
      user: "ubuntu", // ec2-user if you use aws linux kernel, ubuntu if you use ubuntu kernel
      host: "54.169.183.129", // public ip address of the ec2 instance
      ref: "main", // specify the branch where your code resides
      repo: "https://github.com/byline2009/node-ai-next.git", //ssh git url of your repo
      path: "/home/ec2-user/ai-node-next/node-ai-next", // mention the path in ec2 instance where your code need to be eg /home/ec2-user
      "pre-deploy-local": "",
      "post-deploy":
        "source ~/.nvm/nvm.sh && npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      ssh_options: "ForwardAgent=yes",
    },
  },
};
