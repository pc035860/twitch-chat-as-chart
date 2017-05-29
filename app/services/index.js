export default (ngModule) => {
  const list = [
    require('./twitchApi')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
