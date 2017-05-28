export default (ngModule) => {
  const list = [
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
