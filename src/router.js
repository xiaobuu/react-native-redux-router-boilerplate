// Modified implementation from react-native-router-redux

import React, { BackAndroid, Platform, Navigator, StyleSheet, View } from 'react-native';
import Animations from './libs/animations';
import { actionTypes } from './modules/router';

const actionMap = {
  push: actionTypes.ROUTER_PUSH,
  replace: actionTypes.ROUTER_REPLACE,
  reset: actionTypes.ROUTER_RESET,
};

export class Schema extends React.Component {
  className() {
    return 'Schema';
  }

  render() {
    return null;
  }
}

export class Route extends React.Component {
  className() {
    return 'Route';
  }

  render() {
    return null;
  }
}

export class TabRoute extends React.Component {
  className() {
    return 'TabRoute';
  }

  render() {
    return null;
  }
}

export class Router extends React.Component {
  constructor(props) {
    super(props);

    const { actions = {}, dispatch } = props;
    actions.routes = {};

    this.routes = {};

    this.schemas = {
      default: {
        actions: props.actions,
        layout: 'flex',
        sceneConfig: Animations.FlatFloatFromRight,
      },
    };
    this.schemas.tabs = Object.assign({}, this.schemas.default);

    this.tabStyles = {};
    this.initial = { name: props.initial };

    React.Children.forEach(props.children, (child, index) => {
      var name = child.props.name;

      if (child.type.prototype.className() == 'Schema') {
        this.schemas[name] = Object.assign({}, this.schemas[name], child.props);
        if (name === 'default') {
          this.schemas.tabs = Object.assign({}, this.schemas.tabs, {
            footer: child.props.tabBar,
          });

          Object.keys(this.schemas).forEach(key => {
            this.schemas[key] = Object.assign(
              {}, this.schemas.default, this.schemas[key]);
          });
        }
      } else if (child.type.prototype.className() == 'TabRoute') {
        const tabBarName = child.props.name;
        this.routes[tabBarName] = {};
        this.tabStyles[tabBarName] = {
          barTint: child.props.barTint,
          tint: child.props.tint,
        };
        actions.routes[tabBarName] = {};
        React.Children.forEach(child.props.children, (tabChild, tabIndex) => {
          const tabName = tabChild.props.name;
          this.routes[tabBarName][tabName] = tabChild.props;
          this.routes[tabName] = tabChild.props;
          if (tabChild.props.initial || !this.initial.name) {
            this.initial.name = tabName;
            this.initial.tabBarName = tabBarName;
          }
          if (props.initial === tabName) {
            this.initial.tabBarName = tabBarName;
          }
          actions.routes[tabBarName][tabName] = (data = {}) => e => {
            if (typeof(data) !== 'object') {
              data = { data }
            }

            dispatch({
              type: actionMap[data.type || tabChild.props.type] || 'ROUTER_PUSH',
              payload: { name: tabName, tabBarName, data }
            });
          };
        });
      } else if (child.type.prototype.className() == 'Route') {
        if (child.props.initial || !this.initial.name) {
          this.initial.name = name;
        }

        actions.routes[name] = (data = {}) => e => {
          if (typeof(data) !== 'object') {
            data = { data }
          }

          dispatch({
            type: actionMap[data.type || child.props.type] || 'ROUTER_PUSH',
            payload: { name, data },
          });
        };

        this.routes[name] = child.props;

        if (!child.props.component && !child.props.children) {
          console.error('No route component is defined for name: ' + name);
          return;
        }
      }
    });

    this.initialRoute = this.routes[this.initial.name]
      || console.error('No initial route ' + this.initial.name);
  }

  componentDidMount() {
    this.props.actions.init(this.initial);
    // handle android back key
    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', () => {
        if (this.props.router.routes.length > 1) {
          this.props.actions.pop();
          return true;
        }
        return false;
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const routeKey = router => (
      '' + router.activeTabBar + router.activeTab + router.currentRoute
    );

    if (routeKey(this.props.router) !== routeKey(nextProps.router)) {
      this.handleRouteChange(nextProps.router);
    }
  }

  render() {
    if (!(this.props.initial || this.initial)) {
      console.error('No initial attribute!');
    }

    this.initialRoute = this.routes[this.props.initial || this.initial.name];

    if (!this.initialRoute) {
      console.error('No initial route!');
    }

    const currentRoute = this.getRoute(
      this.routes[this.props.router.currentRoute],
      this.props.router);

    let footer = currentRoute.footer;
    if (footer) {
      footer = React.addons.cloneWithProps(footer, {
        navigator: this.refs.nav,
      });
    }

    return (
      <View style={styles.transparent}>
        <Navigator
          configureScene={(route) => route.sceneConfig}
          initialRoute={this.getRoute(this.initialRoute, this.props.router)}
          ref="nav"
          renderScene={this.renderScene.bind(this)}
        />
        {footer}
      </View>
    );
  }

  renderScene(route, navigator) {
    var Component = route.component;
    var navBar = route.navigationBar;

    if (navBar) {
      navBar = React.addons.cloneWithProps(navBar, {
        navigator: navigator,
        route: route,
        router: this.props.router,
      });
    }

    var props = Object.assign({}, this.props);
    delete props.children;
    delete props.initial;

    var child = null;
    if (Component) {
      child = (
        <Component
          key={route.name}
          {...props}
          {...route.passProps}
          />
      );
    } else {
      child = React.Children.only(this.routes[route.name].children);
      child = React.addons.cloneWithProps(child, {schemas: this.schemas});
    }

    const layout = this.schemas.default.layout;

    if (layout === 'flex') {
      return (
        <View style={styles.transparent}>
          {navBar}
          {child}
        </View>
      );
    } else if (layout === 'absolute') {
      return (
        <View style={styles.transparent}>
          {child}
          {navBar}
        </View>
      );
    } else {
      return console.error('Layout should be flex or absolute.');
    }
  }

  getRoute(routeProps, router = { data: {} }) {
    const { data = {} } = router;

    if (!routeProps) {
      return {};
    }

    var schema = this.schemas[routeProps.schema || 'default'] || {};

    if (router.activeTabBar && this.schemas.tabs) {
      schema = this.schemas.tabs
      var tabs = this.routes[router.activeTabBar];
      var tabStyles = this.tabStyles[router.activeTabBar];
    }

    var sceneConfig = routeProps.sceneConfig || schema.sceneConfig || Animations.None;
    var NavBar = routeProps.navBar || schema.navBar;
    var Footer = routeProps.footer || schema.footer;

    var navBar;
    if (NavBar) {
      navBar = (
        <NavBar {...schema} {...routeProps} {...data} />
      );
    }

    var footer;
    if (Footer){
      footer = (
        <Footer {...schema} {...routeProps} {...data}
          activeTab={router.activeTab}
          tabs={tabs}
          tabStyles={tabStyles}
          />
      );
    }

    return {
      component: routeProps.component,
      footer: routeProps.hideFooter ? null : footer,
      name: routeProps.name,
      navigationBar: routeProps.hideNavBar ? null : navBar,
      passProps: { routerData: data },
      sceneConfig: { ...sceneConfig },
    }
  }

  handleRouteChange(router) {
    const { data = {}, mode } = router;

    if (mode === actionTypes.ROUTER_CHANGE_TAB) {
      let routes = [];

      if (router.routeStacks[router.activeTabBar][router.activeTab]) {
        routes = router.routeStacks[router.activeTabBar][router.activeTab];
      } else {
        routes = router.routes.map(route => (
          this.getRoute(this.routes[route], router)
        ));
      }

      this.refs.nav.immediatelyResetRouteStack(routes);
    }

    if (mode === actionTypes.ROUTER_POP) {
      const num = data.num || 1;
      const routes = this.refs.nav.getCurrentRoutes();
      if (num < routes.length) {
        this.refs.nav.popToRoute(routes[routes.length - 1 - num]);
      } else {
        this.refs.nav.popToTop();
      }
    }

    if (mode === actionTypes.ROUTER_PUSH) {
      this.refs.nav.push(this.getRoute(
        this.routes[router.currentRoute], router
      ));
    }

    if (mode === actionTypes.ROUTER_REPLACE) {
      this.refs.nav.replace(this.getRoute(
        this.routes[router.currentRoute], router
      ));
    }

    if (mode === actionTypes.ROUTER_RESET) {
      this.refs.nav.immediatelyResetRouteStack([
        this.getRoute(this.routes[router.currentRoute], router)
      ]);
    }
  }
}

var styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  transparent: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
