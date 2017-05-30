export default (ngModule) => {
  const list = [
    require('./twitchVod'),
    require('./chart'),
    require('./vodFloatingPanel')
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
