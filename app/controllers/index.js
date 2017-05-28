export default (ngModule) => {
  const list = [
    require('./AppCtrl'),
    require('./HomeCtrl'),
    require('./VodCtrl'),
  ];
  list.forEach(({ default: configure }) => configure(ngModule));
};
