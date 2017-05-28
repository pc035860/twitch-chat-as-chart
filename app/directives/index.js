export default (ngModule) => {
  const list = [
    require('./chart')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
