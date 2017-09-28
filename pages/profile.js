// Module imports
import React from 'react'





// Component imports
import Page from '../components/Page'
import TabbedPanel from '../components/TabbedPanel'
import UserOverview from '../components/UserOverview'
import UserRatsPanel from '../components/UserRatsPanel'
import UserSettings from '../components/UserSettings'
import UserShipsPanel from '../components/UserShipsPanel'
import UserStatsOverview from '../components/UserStatsOverview'





// Component imports
const title = 'Profile'





class Profile extends React.Component {

  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  render () {
    return (
      <div className="page-wrapper">
        <header className="page-header">
          <h2>{title}</h2>
        </header>

        <div className="page-content">
          <TabbedPanel
            name="User Tabs"
            tabs={this.tabs} />
        </div>
      </div>
    )
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  get tabs () {
    return [
      {
        default: true,
        component: (<UserOverview />),
        title: 'Overview',
      },
      {
        component: (<UserRatsPanel />),
        title: 'Rats',
      },
      {
        component: (<UserShipsPanel />),
        title: 'Ships',
      },
//      {
//        component: (<UserStatsOverview />),
//        title: 'Stats',
//      },
//      {
//        component: (<div>Badge</div>),
//        title: 'Badge',
//      },
      {
        component: (<UserSettings />),
        title: 'Settings',
      },
    ]
  }
}





export default Page(Profile, title)
