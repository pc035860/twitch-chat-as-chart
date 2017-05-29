export default (ngModule) => {
  const list = [
    require('./twitchVod'),
    require('./chart')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
