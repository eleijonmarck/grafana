import React, { PureComponent } from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { StoreState } from '../../../../types';
import { getSubMenuVariables } from '../../../variables/state/selectors';
import { VariableModel } from '../../../variables/types';
import { DashboardModel } from '../../state';
import { DashboardLinks } from './DashboardLinks';
import { Annotations } from './Annotations';
import { SubMenuItems } from './SubMenuItems';
import { DashboardLink } from '../../state/DashboardModel';
import { AnnotationQuery } from '@grafana/data';

interface OwnProps {
  dashboard: DashboardModel;
  links: DashboardLink[];
  annotations: AnnotationQuery[];
}

interface ConnectedProps {
  variables: VariableModel[];
}

interface DispatchProps {}

type Props = OwnProps & ConnectedProps & DispatchProps;

class SubMenuUnConnected extends PureComponent<Props> {
  onAnnotationStateChanged = (updatedAnnotation: any) => {
    // we're mutating dashboard state directly here until annotations are in Redux.
    for (let index = 0; index < this.props.dashboard.annotations.list.length; index++) {
      const annotation = this.props.dashboard.annotations.list[index];
      if (annotation.name === updatedAnnotation.name) {
        annotation.enable = !annotation.enable;
        break;
      }
    }
    this.props.dashboard.startRefresh();
    this.forceUpdate();
  };

  render() {
    const { dashboard, variables, links, annotations } = this.props;

    if (!dashboard.isSubMenuVisible()) {
      return null;
    }

    return (
      <div className="submenu-controls">
        <SubMenuItems variables={variables} />
        <Annotations annotations={annotations} onAnnotationChanged={this.onAnnotationStateChanged} />
        <div className="gf-form gf-form--grow" />
        {dashboard && <DashboardLinks dashboard={dashboard} links={links} />}
        <div className="clearfix" />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state) => {
  return {
    variables: getSubMenuVariables(state.templating.variables),
  };
};

export const SubMenu = connect(mapStateToProps)(SubMenuUnConnected);

SubMenu.displayName = 'SubMenu';
