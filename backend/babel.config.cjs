module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: "current" },
        modules: false, // keep native ESM so setup files don't inject CommonJS require
      },
    ],
  ],
};
