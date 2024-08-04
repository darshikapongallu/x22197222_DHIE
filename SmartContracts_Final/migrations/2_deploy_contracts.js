const MainnetDocumentOwnership = artifacts.require("MainnetDocumentOwnership");
const zkRollupDocumentAuxiliary = artifacts.require("zkRollupDocumentAuxiliary");


module.exports = function (deployer) {
  deployer.deploy(MainnetDocumentOwnership);
  deployer.deploy(zkRollupDocumentAuxiliary);
};
