export function getWallets() {
  console.log("getWallets");
  return [
    { name: "W" },
    { name: "Wallet " },
    { name: "Wallet 3" },
    { name: "Wallet 4" },
    { name: "Wallet 5" },
    { name: "Wallet 6" },
    { name: "Wallet 7" },
    { name: "Wallet 8" },
    { name: "Wallet 9" },
    { name: "Wallet 10" },
    { name: "Wallet 11" },
    { name: "Wallet 12" },
    { name: "Wallet 13" },
    { name: "Wallet 14" },
    { name: "Wallet 15" },
    { name: "Wallet 16" },
  ];
}

const exampleAddr = {
  index: 0,
  address: "tst1qpyd2srlaezh2mdrz2n40w7la42cgltkvy0wpvs0hgmxmakmmfynslak3f8",
};

export function getAccounts(walletName: string) {
  console.log("getAccounts of", walletName);
  return [
    { name: "Mary", index: 0, addresses: [exampleAddr] },
    { name: "John", index: 1, addresses: [exampleAddr] },
    { name: "Alice", index: 2, addresses: [exampleAddr] },
    { name: "Bob", index: 3, addresses: [exampleAddr] },
    { name: "Charlie", index: 4, addresses: [exampleAddr] },
    { name: "David", index: 5, addresses: [exampleAddr] },
    { name: "Eve", index: 6, addresses: [exampleAddr] },
    { name: "Frank", index: 7, addresses: [exampleAddr] },
    { name: "Grace", index: 8, addresses: [exampleAddr] },
    { name: "Hank", index: 9, addresses: [exampleAddr] },
    { name: "Ivy", index: 10, addresses: [exampleAddr] },
    { name: "Jack", index: 11, addresses: [exampleAddr] },
    { name: "Kate", index: 12, addresses: [exampleAddr] },
    { name: "Liam", index: 13, addresses: [exampleAddr] },
    { name: "Mia", index: 14, addresses: [exampleAddr] },
    { name: "Nick", index: 15, addresses: [exampleAddr] },
  ];
}
